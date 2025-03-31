"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  TextField,
  Button,
} from "@mui/material";
import { supabase } from "../utils/supabaseClient";

interface User {
  id: number;
  user_name: string;
  phone: string;
}

export default function Users() {
  const [usersData, setUsersData] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [newUserName, setNewUserName] = useState<string>("");
  const [newPhone, setNewPhone] = useState<string>("");

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, user_name, phone");

      if (error) {
        console.error("Error fetching users:", error);
      } else if (data) {
        setUsersData(data as User[]);
      }
    };

    fetchUsers();
  }, []);

  
  

  

  const filteredData = usersData.filter(
    (user) =>
      user.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ marginLeft: "80px", padding: "1rem", display: "flex", flexDirection: "column", height: "100vh" }}>
      <Sidebar />
      <div
        style={{
          background: "#FFF",
          padding: "1rem",
          borderBottom: "1px solid #CCC",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        <TextField
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          label="بحث حسب الاسم أو الهاتف"
          variant="outlined"
          style={{ marginRight: "1rem", width: "40%" }}
        />
        <TextField
          value={newUserName}
          onChange={(e) => setNewUserName(e.target.value)}
          label="اسم المستخدم"
          variant="outlined"
          style={{ marginRight: "1rem", width: "20%" }}
        />
        <TextField
          value={newPhone}
          onChange={(e) => setNewPhone(e.target.value)}
          label="الهاتف"
          variant="outlined"
          style={{ marginRight: "1rem", width: "20%" }}
        />
        <Button
          
          variant="contained"
          style={{
            backgroundColor: "#FFD700",
            color: "#000",
            marginRight: "1rem",
          }}
        >
          Add
        </Button>
        <Button
          
          variant="contained"
          style={{
            backgroundColor: "#00FF00",
            color: "#000",
          }}
        >
          Save
        </Button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: "#FFD700",
                  "& th": {
                    borderBottom: "2px solid #000",
                    color: "#000",
                    fontWeight: "bold",
                    border: "1px solid #000",
                  },
                }}
              >
                <TableCell>ID</TableCell>
                <TableCell>اسم الكابتن</TableCell>
                <TableCell>الهاتف</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((user) => (
                <TableRow key={user.id}>
                  <TableCell sx={{ border: "1px solid #CCC" }}>{user.id}</TableCell>
                  <TableCell sx={{ border: "1px solid #CCC" }}>{user.user_name}</TableCell>
                  <TableCell sx={{ border: "1px solid #CCC" }}>{user.phone}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}
