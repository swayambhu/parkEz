import React, { useEffect, useState } from "react";
import styled from "styled-components";

const AuthRecords = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/auth_records")
      .then((response) => response.json())
      .then((data) => setRecords(data));
  }, []);

  return (
    <Wrapper>
      <Table>
        <thead>
          <tr>
            <Th>Created At</Th>
            <Th>Username</Th>
            <Th>Password</Th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, i) => (
            <tr key={i}>
              <Td>{record.created_at}</Td>
              <Td>{record.username}</Td>
              <Td>{record.password}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: 50px 20px;
  display: flex;
  flex-direction: column;
  gap: 30px;
  align-items: center;
  background-color: #eeeeee;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 1.2rem;
`;

const Th = styled.th`
  text-align: left;
  padding: 8px;
  background-color: #f2f2f2;
  border: 1px solid #ddd;
`;

const Td = styled.td`
  text-align: left;
  padding: 8px;
  border: 1px solid #ddd;
`;

export default AuthRecords;
