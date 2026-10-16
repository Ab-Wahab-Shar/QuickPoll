<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = 'localhost';
$db   = 'quickpoll_db';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

$action = $_GET['action'] ?? '';

// 1. GET POLLS
if ($action === 'get_polls') {
    $userId = trim($_GET['userid'] ?? 'guest');

    // Fetch all polls
    $stmt = $pdo->query("SELECT * FROM polls ORDER BY id ASC");
    $pollsRaw = $stmt->fetchAll();

    $polls = [];
    foreach ($pollsRaw as $p) {
        $pollId = (int)$p['id'];
        
        // Fetch options with accurate vote counts
        $optStmt = $pdo->prepare("
            SELECT po.id, po.candidate_name AS name, po.roll_no AS rollNo, po.initials, 
                   COUNT(v.id) AS votes
            FROM poll_options po
            LEFT JOIN votes v ON v.option_id = po.id
            WHERE po.poll_id = ?
            GROUP BY po.id, po.candidate_name, po.roll_no, po.initials
            ORDER BY po.id ASC
        ");
        $optStmt->execute([$pollId]);
        $options = $optStmt->fetchAll();

        foreach ($options as &$opt) {
            $opt['votes'] = (int)$opt['votes'];
            $opt['id'] = (int)$opt['id'];
        }

        $polls[$pollId] = [
            'id' => $pollId,
            'title' => $p['title'],
            'status' => $p['status'],
            'expiry' => 'Closes today at 5:00 PM',
            'totalEligible' => (int)$p['total_eligible'],
            'audience' => $p['audience'],
            'options' => $options
        ];
    }

    // Check user votes
    $userVotes = [];
    if ($userId !== '' && $userId !== 'guest') {
        $uStmt = $pdo->prepare("SELECT id FROM users WHERE university_id = ?");
        $uStmt->execute([$userId]);
        $uRow = $uStmt->fetch();
        if ($uRow) {
            $dbUserId = (int)$uRow['id'];
            $vStmt = $pdo->prepare("SELECT poll_id FROM votes WHERE user_id = ?");
            $vStmt->execute([$dbUserId]);
            $votes = $vStmt->fetchAll();
            foreach ($votes as $v) {
                $userVotes[(string)$v['poll_id']] = true;
            }
        }
    }

    echo json_encode([
        'status' => 'success',
        'polls' => $polls,
        'userVotes' => (object)$userVotes
    ]);
    exit();
}

// 2. GET PROFILE
if ($action === 'get_profile') {
    $id = trim($_GET['id'] ?? '');
    if (!$id || $id === 'guest') {
        echo json_encode(['status' => 'error', 'message' => 'No profile for guest']);
        exit();
    }

    $stmt = $pdo->prepare("
        SELECT p.name, p.roll_no AS rollNo, p.department, p.semester, p.designation, p.email, p.avatar_url AS avatarUrl,
               u.role, u.university_id AS facultyId
        FROM profiles p
        JOIN users u ON p.user_id = u.id
        WHERE u.university_id = ?
    ");
    $stmt->execute([$id]);
    $profile = $stmt->fetch();

    if ($profile) {
        if ($profile['role'] === 'student') {
            unset($profile['facultyId']);
        }
        echo json_encode(['status' => 'success', 'profile' => $profile]);
    } else {
        $isTeacher = (stripos($id, 'T-') === 0 || strtolower($id) === 'teacher' || strtolower($id) === 'admin');
        echo json_encode([
            'status' => 'success',
            'profile' => [
                'name' => $id,
                'rollNo' => $id,
                'facultyId' => $isTeacher ? $id : null,
                'role' => $isTeacher ? 'teacher' : 'student',
                'department' => 'Information Technology',
                'semester' => $isTeacher ? null : 'Semester 6',
                'designation' => $isTeacher ? 'Assistant Prof' : null,
                'email' => strtolower($id) . '@university.edu',
                'avatarUrl' => null
            ]
        ]);
    }
    exit();
}

// 3. LOGIN
if ($action === 'login') {
    $data = json_decode(file_get_contents('php://input'), true);
    $studentId = trim($data['studentId'] ?? '');
    $roleType = trim($data['roleType'] ?? 'student');
    $password = trim($data['password'] ?? 'password123');

    if (!$studentId) {
        echo json_encode(['status' => 'error', 'message' => 'ID is required']);
        exit();
    }

    $stmt = $pdo->prepare("SELECT * FROM users WHERE university_id = ?");
    $stmt->execute([$studentId]);
    $user = $stmt->fetch();

    if ($user) {
        $actualRole = $user['role'];

        // Synchronize role if logging in as teacher or holding faculty title/prefix (e.g. Dr, Prof, T-)
        $isFacultyLogin = ($roleType === 'teacher' || stripos($studentId, 'T-') === 0 || stripos($studentId, 'Dr ') === 0 || stripos($studentId, 'Dr.') === 0 || stripos($studentId, 'Prof') === 0 || strtolower($studentId) === 'admin' || strtolower($studentId) === 'teacher');
        if ($isFacultyLogin && $user['role'] !== 'teacher') {
            $updRole = $pdo->prepare("UPDATE users SET role = 'teacher' WHERE id = ?");
            $updRole->execute([$user['id']]);
            $actualRole = 'teacher';

            $updProf = $pdo->prepare("UPDATE profiles SET designation = COALESCE(designation, 'Assistant Prof'), semester = NULL WHERE user_id = ?");
            $updProf->execute([$user['id']]);
        }

        // Make sure a profile row exists
        $profCheck = $pdo->prepare("SELECT id FROM profiles WHERE user_id = ?");
        $profCheck->execute([$user['id']]);
        if (!$profCheck->fetch()) {
            $insProf = $pdo->prepare("
                INSERT INTO profiles (user_id, name, roll_no, department, semester, designation, email)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $insProf->execute([
                $user['id'],
                $studentId,
                $studentId,
                'Information Technology',
                $actualRole === 'student' ? 'Semester 6' : null,
                $actualRole === 'teacher' ? 'Assistant Prof' : null,
                strtolower($studentId) . '@university.edu'
            ]);
        }
    } else {
        $actualRole = ($roleType === 'teacher' || stripos($studentId, 'T-') === 0 || stripos($studentId, 'Dr ') === 0 || stripos($studentId, 'Dr.') === 0 || stripos($studentId, 'Prof') === 0 || strtolower($studentId) === 'admin' || strtolower($studentId) === 'teacher') ? 'teacher' : 'student';
        
        $ins = $pdo->prepare("INSERT INTO users (university_id, password, role) VALUES (?, ?, ?)");
        $ins->execute([$studentId, $password ?: 'password123', $actualRole]);
        $newUserId = $pdo->lastInsertId();

        $insProf = $pdo->prepare("
            INSERT INTO profiles (user_id, name, roll_no, department, semester, designation, email)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $insProf->execute([
            $newUserId,
            $studentId,
            $studentId,
            'Information Technology',
            $actualRole === 'student' ? 'Semester 6' : null,
            $actualRole === 'teacher' ? 'Assistant Prof' : null,
            strtolower($studentId) . '@university.edu'
        ]);
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Logged in successfully',
        'role' => $actualRole,
        'userId' => $studentId
    ]);
    exit();
}

// 4. CAST VOTE
if ($action === 'cast_vote') {
    $data = json_decode(file_get_contents('php://input'), true);
    $userId = trim($data['userId'] ?? 'guest');
    $pollId = (int)($data['pollId'] ?? 0);
    $optionDbId = (int)($data['optionId'] ?? 0);
    $optionIndex = isset($data['optionIndex']) ? (int)$data['optionIndex'] : -1;

    if ($userId === '' || $userId === 'guest') {
        echo json_encode(['status' => 'error', 'message' => 'Guests cannot vote']);
        exit();
    }

    // Get user
    $uStmt = $pdo->prepare("SELECT id, role FROM users WHERE university_id = ?");
    $uStmt->execute([$userId]);
    $user = $uStmt->fetch();

    if (!$user) {
        $insRole = (stripos($userId, 'T-') === 0 || stripos($userId, 'Dr ') === 0 || stripos($userId, 'Dr.') === 0 || stripos($userId, 'Prof') === 0 || strtolower($userId) === 'teacher' || strtolower($userId) === 'admin') ? 'teacher' : 'student';
        $ins = $pdo->prepare("INSERT INTO users (university_id, password, role) VALUES (?, ?, ?)");
        $ins->execute([$userId, 'password123', $insRole]);
        $dbUserId = (int)$pdo->lastInsertId();
        $userRole = $insRole;

        $insProf = $pdo->prepare("
            INSERT INTO profiles (user_id, name, roll_no, department, semester, designation, email)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $insProf->execute([
            $dbUserId,
            $userId,
            $userId,
            'Information Technology',
            $insRole === 'student' ? 'Semester 6' : null,
            $insRole === 'teacher' ? 'Assistant Prof' : null,
            strtolower($userId) . '@university.edu'
        ]);
    } else {
        $dbUserId = (int)$user['id'];
        $userRole = $user['role'];
    }

    // Check poll existence and audience
    $pStmt = $pdo->prepare("SELECT id, status, audience FROM polls WHERE id = ?");
    $pStmt->execute([$pollId]);
    $poll = $pStmt->fetch();

    if (!$poll) {
        echo json_encode(['status' => 'error', 'message' => 'Poll not found']);
        exit();
    }

    if ($poll['status'] !== 'LIVE') {
        echo json_encode(['status' => 'error', 'message' => 'Poll is not currently LIVE']);
        exit();
    }

    // Auto-heal role if poll is for teachers and user has faculty designation/prefix but was misassigned
    if ($poll['audience'] === 'teacher' && $userRole === 'student') {
        $isFacultyId = (stripos($userId, 'T-') === 0 || stripos($userId, 'Dr ') === 0 || stripos($userId, 'Dr.') === 0 || stripos($userId, 'Prof') === 0 || strtolower($userId) === 'teacher' || strtolower($userId) === 'admin');
        if ($isFacultyId) {
            $pdo->prepare("UPDATE users SET role = 'teacher' WHERE id = ?")->execute([$dbUserId]);
            $pdo->prepare("UPDATE profiles SET designation = COALESCE(designation, 'Assistant Prof'), semester = NULL WHERE user_id = ?")->execute([$dbUserId]);
            $userRole = 'teacher';
        }
    }

    if ($poll['audience'] !== $userRole) {
        echo json_encode(['status' => 'error', 'message' => 'User not authorized for this poll audience']);
        exit();
    }

    // Resolve target option ID accurately
    $targetOptionId = null;

    // Check direct ID first
    if ($optionDbId > 0) {
        $checkOpt = $pdo->prepare("SELECT id FROM poll_options WHERE id = ? AND poll_id = ?");
        $checkOpt->execute([$optionDbId, $pollId]);
        $optRow = $checkOpt->fetch();
        if ($optRow) {
            $targetOptionId = (int)$optRow['id'];
        }
    }

    // Fallback to index if needed
    if (!$targetOptionId) {
        $optStmt = $pdo->prepare("SELECT id FROM poll_options WHERE poll_id = ? ORDER BY id ASC");
        $optStmt->execute([$pollId]);
        $allOptions = $optStmt->fetchAll();

        $idx = ($optionIndex >= 0) ? $optionIndex : (is_numeric($data['optionId'] ?? null) ? (int)$data['optionId'] : -1);
        if ($idx >= 0 && isset($allOptions[$idx])) {
            $targetOptionId = (int)$allOptions[$idx]['id'];
        }
    }

    if (!$targetOptionId) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid candidate option selected']);
        exit();
    }

    // Check duplicate vote in database
    $checkStmt = $pdo->prepare("SELECT id FROM votes WHERE user_id = ? AND poll_id = ?");
    $checkStmt->execute([$dbUserId, $pollId]);
    if ($checkStmt->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'You have already voted in this election']);
        exit();
    }

    // Insert vote securely
    try {
        $voteStmt = $pdo->prepare("INSERT INTO votes (user_id, poll_id, option_id) VALUES (?, ?, ?)");
        $voteStmt->execute([$dbUserId, $pollId, $targetOptionId]);

        // Keep votes_count in sync
        $updCount = $pdo->prepare("UPDATE poll_options SET votes_count = votes_count + 1 WHERE id = ?");
        $updCount->execute([$targetOptionId]);

        echo json_encode(['status' => 'success', 'message' => 'Vote recorded successfully']);
    } catch (\PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Duplicate vote prevented: ' . $e->getMessage()]);
    }
    exit();
}

// 5. UPDATE PROFILE
if ($action === 'update_profile') {
    $data = json_decode(file_get_contents('php://input'), true);
    $userId = trim($data['id'] ?? '');
    $profile = $data['profile'] ?? [];

    if ($userId) {
        $uStmt = $pdo->prepare("SELECT id, role FROM users WHERE university_id = ?");
        $uStmt->execute([$userId]);
        $user = $uStmt->fetch();

        if ($user) {
            $avatar = $profile['avatarUrl'] ?? $profile['avatar_url'] ?? null;
            $semester = $user['role'] === 'student' ? ($profile['semester'] ?? 'Semester 6') : null;
            $designation = $user['role'] === 'teacher' ? ($profile['designation'] ?? 'Assistant Prof') : null;
            $rollNo = trim($profile['rollNo'] ?? $profile['facultyId'] ?? $profile['roll_no'] ?? $userId);
            $name = trim($profile['name'] ?? $userId);
            $department = trim($profile['department'] ?? 'Information Technology');
            $email = trim($profile['email'] ?? (strtolower($userId) . '@university.edu'));

            $profCheck = $pdo->prepare("SELECT id FROM profiles WHERE user_id = ?");
            $profCheck->execute([$user['id']]);
            $existing = $profCheck->fetch();

            if ($existing) {
                $upd = $pdo->prepare("
                    UPDATE profiles 
                    SET name = ?, roll_no = ?, department = ?, semester = ?, designation = ?, email = ?,
                        avatar_url = COALESCE(?, avatar_url)
                    WHERE user_id = ?
                ");
                $upd->execute([
                    $name,
                    $rollNo,
                    $department,
                    $semester,
                    $designation,
                    $email,
                    $avatar,
                    $user['id']
                ]);
            } else {
                $insProf = $pdo->prepare("
                    INSERT INTO profiles (user_id, name, roll_no, department, semester, designation, email, avatar_url)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ");
                $insProf->execute([
                    $user['id'],
                    $name,
                    $rollNo,
                    $department,
                    $semester,
                    $designation,
                    $email,
                    $avatar
                ]);
            }
        }
    }

    echo json_encode(['status' => 'success', 'message' => 'Profile updated successfully']);
    exit();
}

// 6. CHANGE POLL STATUS
if ($action === 'change_poll_status') {
    $data = json_decode(file_get_contents('php://input'), true);
    $pollId = (int)($data['pollId'] ?? 0);
    $status = trim($data['status'] ?? 'LIVE');

    if (in_array($status, ['LIVE', 'PAUSED', 'ENDED']) && $pollId > 0) {
        $stmt = $pdo->prepare("UPDATE polls SET status = ? WHERE id = ?");
        $stmt->execute([$status, $pollId]);
        echo json_encode(['status' => 'success', 'message' => 'Poll status updated']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid parameters']);
    }
    exit();
}

echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
