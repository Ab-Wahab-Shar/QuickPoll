import { createContext, useState, useContext, useEffect } from 'react';

const PollContext = createContext();

export const usePolls = () => useContext(PollContext);

const INITIAL_POLLS = {
  1: {
    id: 1,
    title: 'Class Representative (CR) Election',
    status: 'LIVE',
    expiry: 'Closes today at 5:00 PM',
    totalEligible: 120,
    audience: 'student',
    options: [
      { id: 1, name: 'Student One', rollNo: 'STU-TEST-001', initials: 'S1', votes: 0 },
      { id: 2, name: 'Student Two', rollNo: 'STU-TEST-002', initials: 'S2', votes: 0 },
      { id: 3, name: 'Student Three', rollNo: 'STU-TEST-003', initials: 'S3', votes: 0 },
      { id: 4, name: 'Student Four', rollNo: 'STU-TEST-004', initials: 'S4', votes: 0 }
    ]
  },
  2: {
    id: 2,
    title: 'Girls Representative (GR) Election',
    status: 'LIVE',
    expiry: 'Closes today at 5:00 PM',
    totalEligible: 120,
    audience: 'student',
    options: [
      { id: 5, name: 'Student Five', rollNo: 'STU-TEST-005', initials: 'S5', votes: 0 },
      { id: 6, name: 'Student Six', rollNo: 'STU-TEST-006', initials: 'S6', votes: 0 },
      { id: 7, name: 'Student Seven', rollNo: 'STU-TEST-007', initials: 'S7', votes: 0 },
      { id: 8, name: 'Student Eight', rollNo: 'STU-TEST-008', initials: 'S8', votes: 0 }
    ]
  },
  3: {
    id: 3,
    title: 'SOUTA Faculty Elections',
    status: 'LIVE',
    expiry: 'Closes today at 5:00 PM',
    totalEligible: 200,
    audience: 'teacher',
    options: [
      { id: 43, name: 'Teacher One', rollNo: 'Assistant Prof', initials: 'T1', votes: 0 },
      { id: 44, name: 'Teacher Two', rollNo: 'Associate Prof', initials: 'T2', votes: 0 },
      { id: 45, name: 'Teacher Three', rollNo: 'Assistant Prof', initials: 'T3', votes: 0 },
      { id: 46, name: 'Teacher Four', rollNo: 'Professor', initials: 'T4', votes: 0 }
    ]
  }
};

const DEFAULT_PROFILES = {
  'STU-TEST-001': {
    name: 'Student One',
    rollNo: 'STU-TEST-001',
    role: 'student',
    department: 'Information Technology',
    semester: 'Semester 6',
    email: 'student1@university.edu'
  },
  'STU-TEST-002': {
    name: 'Student Two',
    rollNo: 'STU-TEST-002',
    role: 'student',
    department: 'Information Technology',
    semester: 'Semester 6',
    email: 'student2@university.edu'
  },
  'STU-TEST-003': {
    name: 'Student Three',
    rollNo: 'STU-TEST-003',
    role: 'student',
    department: 'Information Technology',
    semester: 'Semester 6',
    email: 'student3@university.edu'
  },
  'STU-TEST-004': {
    name: 'Student Four',
    rollNo: 'STU-TEST-004',
    role: 'student',
    department: 'Information Technology',
    semester: 'Semester 6',
    email: 'student4@university.edu'
  },
  'STU-TEST-005': {
    name: 'Student Five',
    rollNo: 'STU-TEST-005',
    role: 'student',
    department: 'Information Technology',
    semester: 'Semester 6',
    email: 'student5@university.edu'
  },
  'STU-TEST-006': {
    name: 'Student Six',
    rollNo: 'STU-TEST-006',
    role: 'student',
    department: 'Information Technology',
    semester: 'Semester 6',
    email: 'student6@university.edu'
  },
  'STU-TEST-007': {
    name: 'Student Seven',
    rollNo: 'STU-TEST-007',
    role: 'student',
    department: 'Information Technology',
    semester: 'Semester 6',
    email: 'student7@university.edu'
  },
  'STU-TEST-008': {
    name: 'Student Eight',
    rollNo: 'STU-TEST-008',
    role: 'student',
    department: 'Information Technology',
    semester: 'Semester 6',
    email: 'student8@university.edu'
  },
  'T-01': {
    name: 'Teacher One',
    rollNo: 'T-01',
    facultyId: 'T-01',
    role: 'teacher',
    department: 'Information Technology',
    designation: 'Assistant Prof',
    email: 'teacher1@university.edu'
  },
  'T-02': {
    name: 'Teacher Two',
    rollNo: 'T-02',
    facultyId: 'T-02',
    role: 'teacher',
    department: 'Information Technology',
    designation: 'Associate Prof',
    email: 'teacher2@university.edu'
  },
  'T-03': {
    name: 'Teacher Three',
    rollNo: 'T-03',
    facultyId: 'T-03',
    role: 'teacher',
    department: 'Information Technology',
    designation: 'Assistant Prof',
    email: 'teacher3@university.edu'
  },
  'T-04': {
    name: 'Teacher Four',
    rollNo: 'T-04',
    facultyId: 'T-04',
    role: 'teacher',
    department: 'Information Technology',
    designation: 'Professor',
    email: 'teacher4@university.edu'
  },
  'teacher': {
    name: 'Teacher One',
    rollNo: 'T-01',
    facultyId: 'T-01',
    role: 'teacher',
    department: 'Information Technology',
    designation: 'Assistant Prof',
    email: 'teacher1@university.edu'
  },
  'ADMIN': {
    name: 'Faculty Administrator',
    rollNo: 'ADMIN',
    facultyId: 'ADMIN',
    role: 'teacher',
    department: 'General Studies',
    designation: 'Visiting Faculty',
    email: 'admin@university.edu'
  }
};

export const PollProvider = ({ children }) => {
  const getInitialUser = () => {
    try {
      const saved = localStorage.getItem('quickpoll_user') || sessionStorage.getItem('quickpoll_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { id: 'guest', role: 'student' };
  };

  const [polls, setPolls] = useState(INITIAL_POLLS);
  const [userVotes, setUserVotes] = useState({});
  const [currentUser, setCurrentUser] = useState(getInitialUser);
  const [profiles, setProfiles] = useState(DEFAULT_PROFILES);

  const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.137.1/quickpoll_api/api.php';

  const fetchPolls = async (id = 'guest') => {
    try {
      const res = await fetch(`${API_URL}?action=get_polls&userid=${id}`);
      const data = await res.json();
      if (data.status === 'success' && data.polls && Object.keys(data.polls).length > 0) {
        setPolls(data.polls);
        if (data.userVotes) {
          setUserVotes(prev => ({
            ...prev,
            [id]: typeof data.userVotes === 'object' ? data.userVotes : {}
          }));
        }
      }
    } catch (e) {
      console.warn("API not reachable or failed, using local poll state", e);
    }
  };

  const fetchProfile = async (id) => {
    if (!id || id === 'guest') return;
    try {
      const res = await fetch(`${API_URL}?action=get_profile&id=${id}`);
      const data = await res.json();
      if (data.status === 'success' && data.profile) {
        setProfiles(prev => ({
          ...prev,
          [id]: {
            ...prev[id],
            ...data.profile,
            role: data.profile.role || prev[id]?.role || (id.toUpperCase().startsWith('T-') || id.toLowerCase() === 'teacher' || id.toUpperCase() === 'ADMIN' || id.toLowerCase().startsWith('dr ') || id.toLowerCase().startsWith('dr.') || id.toLowerCase().startsWith('prof') ? 'teacher' : 'student')
          }
        }));
      }
    } catch (e) {
      console.warn("Profile fetch failed, fallback to local profile", e);
    }
  };

  // Initial load
  useEffect(() => {
    const userToFetch = currentUser.id || 'guest';
    fetchPolls(userToFetch);
    if (userToFetch !== 'guest') {
      fetchProfile(userToFetch);
    }
  }, []);

  // Actions
  const login = async (id, role, password = 'password123') => {
    const cleanId = id.trim();
    const isFacultyId = cleanId.toUpperCase().startsWith('T-') || cleanId.toLowerCase() === 'teacher' || cleanId.toUpperCase() === 'ADMIN' || cleanId.toLowerCase().startsWith('dr ') || cleanId.toLowerCase().startsWith('dr.') || cleanId.toLowerCase().startsWith('prof');
    const effectiveRole = role || (isFacultyId ? 'teacher' : 'student');
    let userObj = { id: cleanId, role: effectiveRole };
    setCurrentUser(userObj);
    localStorage.setItem('quickpoll_user', JSON.stringify(userObj));
    sessionStorage.setItem('quickpoll_user', JSON.stringify(userObj));

    if (!profiles[cleanId]) {
      setProfiles(prev => ({
        ...prev,
        [cleanId]: {
          name: cleanId === 'STU-TEST-001' ? 'Student One' : cleanId,
          rollNo: cleanId,
          facultyId: effectiveRole === 'teacher' ? cleanId : undefined,
          role: effectiveRole,
          department: 'Information Technology',
          semester: effectiveRole === 'student' ? 'Semester 6' : undefined,
          designation: effectiveRole === 'teacher' ? 'Assistant Prof' : undefined,
          email: `${cleanId.toLowerCase()}@university.edu`
        }
      }));
    }

    try {
      const res = await fetch(`${API_URL}?action=login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: cleanId, password, roleType: effectiveRole })
      });
      const data = await res.json();
      if (data.status === 'success') {
        const confirmedRole = data.role || effectiveRole;
        userObj = { id: cleanId, role: confirmedRole };
        setCurrentUser(userObj);
        localStorage.setItem('quickpoll_user', JSON.stringify(userObj));
        sessionStorage.setItem('quickpoll_user', JSON.stringify(userObj));

        await fetchProfile(cleanId);
        await fetchPolls(cleanId);
      }
    } catch (e) {
      console.warn("Login API failed, offline mode active", e);
    }

    return userObj;
  };

  const logout = () => {
    localStorage.removeItem('quickpoll_user');
    sessionStorage.removeItem('quickpoll_user');
    setCurrentUser({ id: 'guest', role: 'student' });
    fetchPolls('guest');
  };

  const updateProfile = async (id, updatedData) => {
    try {
      const res = await fetch(`${API_URL}?action=update_profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, profile: updatedData })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setProfiles(prev => ({
          ...prev,
          [id]: { ...prev[id], ...updatedData }
        }));
        await fetchProfile(id);
        return { status: 'success', message: data.message || 'Profile changes saved successfully!' };
      } else {
        return { status: 'error', message: data.message || 'Failed to update profile on server.' };
      }
    } catch (e) {
      console.error("Profile Update API failed:", e);
      return { status: 'error', message: 'Network error: Server is unreachable. Profile was not saved.' };
    }
  };

  const castVote = async (pollId, optionIndex) => {
    const voterId = currentUser.id;
    if (voterId === 'guest') {
      return { success: false, message: 'Please log in to vote' };
    }
    if (userVotes[voterId]?.[pollId]) {
      return { success: false, message: 'You have already voted in this poll' };
    }
    if (polls[pollId]?.status !== 'LIVE') {
      return { success: false, message: 'This election is not currently live' };
    }

    if (polls[pollId]?.audience && polls[pollId].audience !== currentUser.role) {
      return { success: false, message: 'You are not eligible for this election' };
    }

    const targetOption = polls[pollId]?.options?.[optionIndex];
    const optionDbId = targetOption ? targetOption.id : null;

    try {
      const res = await fetch(`${API_URL}?action=cast_vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: voterId,
          pollId: Number(pollId),
          optionId: optionDbId,
          optionIndex: optionIndex
        })
      });
      const data = await res.json();

      if (data.status === 'success') {
        // Mark as voted locally
        setUserVotes(prev => ({
          ...prev,
          [voterId]: {
            ...(prev[voterId] || {}),
            [pollId]: true
          }
        }));
        await fetchPolls(voterId);
        return { success: true, message: data.message || 'Vote recorded successfully' };
      } else {
        return { success: false, message: data.message || 'Vote could not be recorded' };
      }
    } catch (e) {
      console.error("Vote cast API failed:", e);
      return { 
        success: false, 
        message: 'Network error: Server is unreachable. Vote could not be saved to database.' 
      };
    }
  };

  const hasVoted = (pollId) => {
    return !!userVotes[currentUser.id]?.[pollId];
  };

  const changePollStatus = async (pollId, newStatus) => {
    setPolls(prev => {
      const target = prev[pollId];
      if (!target) return prev;
      return {
        ...prev,
        [pollId]: {
          ...target,
          status: newStatus
        }
      };
    });

    try {
      await fetch(`${API_URL}?action=change_poll_status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId: Number(pollId), status: newStatus })
      });
    } catch (e) {
      console.warn("Change status API failed", e);
    }
  };

  const getStudentProfile = (id) => {
    if (!id || id === 'guest') return null;
    const baseProfile = profiles[id];
    if (baseProfile) {
      return baseProfile;
    }
    const role = currentUser.role || (id.toUpperCase().startsWith('T-') || id.toLowerCase() === 'teacher' || id.toUpperCase() === 'ADMIN' ? 'teacher' : 'student');
    return {
      name: role === 'teacher' ? `Faculty (${id})` : (id === 'STU-TEST-001' ? 'Student One' : `Student (${id})`),
      rollNo: id,
      facultyId: role === 'teacher' ? id : undefined,
      department: 'Information Technology',
      role: role,
      semester: role === 'student' ? 'Semester 6' : undefined,
      designation: role === 'teacher' ? 'Assistant Prof' : undefined,
      email: `${id.toLowerCase()}@university.edu`
    };
  };

  return (
    <PollContext.Provider value={{
      polls,
      userVotes,
      currentUser,
      login,
      logout,
      castVote,
      hasVoted,
      changePollStatus,
      getStudentProfile,
      updateProfile
    }}>
      {children}
    </PollContext.Provider>
  );
};
