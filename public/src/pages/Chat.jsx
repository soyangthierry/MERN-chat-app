import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import styled from "styled-components";
import { allUsersRoute, getGroups, host } from "../utils/APIRoutes";
import ChatContainer from "../components/ChatContainer";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";
import bgImg from '../assets/bg.png' 

export default function Chat() {
  const navigate = useNavigate();
  const socket = useRef();
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [currentChatIsGroup, setCurrentChatIsGroup] = useState(undefined);
  const [groups, setGroups] = useState([]);
  useEffect(async () => {
    if (!localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)) {
      navigate("/login");
    } else {
      setCurrentUser(
        await JSON.parse(
          localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
        )
      );
    }
  }, []);
  useEffect(() => {
    if (currentUser) {
      socket.current = io(host);
      socket.current.emit("add-user", currentUser._id);
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        if (currentUser.isAvatarImageSet) {
          const userData = await axios.get(`${allUsersRoute}/${currentUser._id}`);
          setContacts(userData.data);
          const userGroups = await axios.get(`${getGroups}/${currentUser._id}`);
          setGroups(userGroups.data.groups);
        } else {
          navigate("/setAvatar");
        }
      }
    };
  
    fetchUserData();
  }, [currentUser]);
  const handleChatChange = (chat,isGroup) => {
    setCurrentChat(chat);
    setCurrentChatIsGroup(isGroup);
  };
  return (
    <>
      <Container>
        <div className="container">
        <Contacts contacts={contacts} groups={groups} changeChat={handleChatChange}  />
          {currentChat === undefined ? (
            <Welcome />
          ) : (
            <ChatContainer currentChat={currentChat} socket={socket} isGroup={currentChatIsGroup}/>
          )}
        </div>
      </Container>
    </>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-image: url(${bgImg});
  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;
