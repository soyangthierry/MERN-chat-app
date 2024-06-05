import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { sendMessageRoute, recieveMessageRoute, getGroupMembers, getUserDetails } from "../utils/APIRoutes";
import groupAvatarUrl from "../assets/logo.png"; // Default group avatar

export default function ChatContainer({ currentChat, socket, isGroup }) {
  const [messages, setMessages] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const scrollRef = useRef();

  useEffect(() => {
    const fetchMessages = async () => {
      const userData = await JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY));
      const requestPayload = isGroup ? { from: userData._id, groupId: currentChat._id } : { from: userData._id, to: currentChat._id };
      const response = await axios.post(recieveMessageRoute, requestPayload);
      
      // For group messages, fetch sender names from the server
      if (isGroup) {
        const senderIds = response.data.map(msg => msg.sender);
        const senderDetailsResponse = await axios.post(`${getUserDetails}`, { userIds: senderIds });
        const senderDetailsMap = {};
        senderDetailsResponse.data.forEach(user => {
          senderDetailsMap[user._id] = user.username;
        });
        console.log(response.data)
        
        const updatedMessages = response.data.map(msg => ({
          ...msg,
          senderName: senderDetailsMap[msg.sender],
        }));
        
        setMessages(updatedMessages);
        
        const groupResponse = await axios.get(`${getGroupMembers}/${currentChat._id}`);
        setGroupMembers(groupResponse.data.members);
      } else {
        setMessages(response.data);
      }
    };

    if (currentChat) {
      fetchMessages();
    }
  }, [currentChat, isGroup]);

  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-receive", (msg) => {
        setArrivalMessage(msg);
      });
    }
  }, [socket]);

  useEffect(() => {
    if (arrivalMessage) {
      setMessages((prev) => [...prev, arrivalMessage]);
    }
  }, [arrivalMessage]);

  const handleSendMsg = async (msg) => {
    const userData = await JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY));
    const messageData = {
      from: userData._id,
      to: currentChat._id,
      message: msg.message,
      type: msg.type,
      isGroup,
      groupId: isGroup ? currentChat._id : undefined,
      senderName: userData.username,
    };

    socket.current.emit("send-msg", messageData);
    await axios.post(sendMessageRoute, messageData);

    setMessages((prev) => [...prev, { ...messageData, fromSelf: true }]);
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Container>
      <div className="chat-header">
        <div className="user-details">
          <div className="avatar">
            <img src={isGroup ? groupAvatarUrl : `data:image/svg+xml;base64,${currentChat.avatarImage}`} alt="avatar" />
          </div>
          <div className="username">
            <h3>{isGroup ? currentChat.name : currentChat.username}</h3>
            {isGroup && (
              <div className="group-members">
                {groupMembers.map((member) => (
                  <span key={member._id}>{member.username}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        <Logout />
      </div>
      <div className="chat-messages">
        {messages.map((message) => (
          <div
            ref={scrollRef}
            key={uuidv4()}
            className={`message ${message.fromSelf ? "sended" : "received"}`}
          >
            <div className="content">
              {/* Display sender name for group messages sent by other members */}
              {isGroup && !message.fromSelf && (
                <span className="sender-name">{message.senderName}: </span>
              )}

              {/* Display message content */}
              {message.type === "text" ? (
                <p>{message.message}</p>
              ) : (
                <img src={message.message} alt="sent content" />
              )}
            </div>
          </div>
        ))}
      </div>
      <ChatInput handleSendMsg={handleSendMsg} />
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;

  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #07197bcc;
    padding: 0 2rem;

    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;

      .avatar img {
        height: 3rem;
      }

      .username {
        h3 {
          color: white;
        }

        .group-members {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;

          span {
            color: #d1d1d1;
            background: #00000050;
            padding: 0.2rem 0.5rem;
            border-radius: 0.5rem;
          }
        }
      }
    }
  }

  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;

    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }

    .message {
      display: flex;
      align-items: center;

      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;

        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
          img {
          max-width: 100%; /* Ensure images don't exceed container width */
          max-height: 100%; /* Ensure images don't exceed container height */
          object-fit: contain; /* Maintain aspect ratio without distorting */
          border-radius: 0.5rem; /* Optional: Apply border radius to images */
        }
      }

      .sender-name {
        font-weight: bold;
        margin-right: 0.5rem;
      }
    }

    .sended {
      justify-content: flex-end;

      .content {
        background-color: #1932b7;
      }
    }

    .received {
      justify-content: flex-start;

      .content {
        background-color: #397ef3;
      }
    }
  }
`;
