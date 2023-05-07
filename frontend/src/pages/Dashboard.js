import React, { useEffect, useState } from 'react';

const Dashboard = () => {
  const [userName, setUserName] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [fullName, setFullName] = useState(null);



  
  useEffect(() => {
    const username = localStorage.getItem('user_email');
    const role = localStorage.getItem('user_role');
    const fn = localStorage.getItem('full_name');
    setUserName(username);
    setUserRole(role);
    setFullName(fn);
    
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {userName != null ? (
        <div>
          <h2>Welcome, {fullName}</h2>
          <p>Email: {userName}</p>
          <p>Account Type: {userRole}</p>
        </div>
      ) : (
        <p>Loading user information...</p>
      )}
    </div>
  );
};

export default Dashboard;
