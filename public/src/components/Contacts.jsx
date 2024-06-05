import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { FaPlus } from "react-icons/fa"; // Import the plus icon
import Logo from "../assets/logo.png";
import groupAvatarUrl from "../assets/logo.png";
import { createGroup } from "../utils/APIRoutes";

export default function Contacts({ contacts, changeChat, groups }) {
  const [currentUserName, setCurrentUserName] = useState(undefined);
  const [currentUserImage, setCurrentUserImage] = useState(undefined);
  const [currentUserID,setCurrentUserID] = useState(undefined);
  const [currentSelected, setCurrentSelected] = useState(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [groupName, setGroupName] = useState("");


  useEffect(async () => {
    const data = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );
    setCurrentUserName(data.username);
    setCurrentUserImage(data.avatarImage);
    setCurrentUserID(data._id);
  }, []);

  const changeCurrentChat = (index, contact, isGroup) => {
    setCurrentSelected(index);
    changeChat(contact, isGroup);
  };

  const handleToggleModal = () => {
    setModalOpen(!modalOpen);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleToggleContact = (contactId) => {
    if (selectedContacts.includes(contactId)) {
      setSelectedContacts(selectedContacts.filter((id) => id !== contactId));
    } else {
      setSelectedContacts([...selectedContacts, contactId]);
    }
  };

  const handleCreateGroup = () => {
    const creatorId = currentUserID; // Fill this with the current user's ID
    const body = {
      groupName: groupName,
      creatorId: creatorId,
      userIds: selectedContacts,
    };
    console.log(body)
    // Make a request to create the group
    
     axios.post(createGroup, body)
       .then((response) => {
         // Handle success
         console.log(response)
       })
       .catch((error) => {
         // Handle error
         console.log(error)
     });

    // Close the modal after creating the group
    setModalOpen(false);
  };

  return (
    <>
      {currentUserImage && currentUserImage && (
        <Container>
          <div className="brand">
            <img src={Logo} alt="logo" />
            <h3>nexus</h3>
            {/* Add the plus icon */}
            <div className="icon" onClick={handleToggleModal}>
              <FaPlus />
            </div>
          </div>
          {/* Modal for creating a group */}
          {modalOpen && (
            <ModalContainer>
              <div className="modal">
                <h3>Create a Group</h3>
                <input
                  type="text"
                  placeholder="Group Name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
                <div className="contact-list">
                  {contacts.map((contact) => (
                    <div
                      key={contact._id}
                      className={`contact ${
                        selectedContacts.includes(contact._id)
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => handleToggleContact(contact._id)}
                    >
                      {contact.username}
                    </div>
                  ))}
                </div>
                <button onClick={handleCreateGroup}>Create Group</button>
                <button onClick={handleCloseModal}>Close</button>
              </div>
            </ModalContainer>
          )}
          <div className="contacts">
            {contacts.map((contact, index) => (
              <div
                key={contact._id}
                className={`contact ${
                  currentSelected === contact._id ? "selected" : ""
                }`}
                onClick={() => changeCurrentChat(index, contact, false)}
              >
                <div className="avatar">
                  <img
                    src={`data:image/svg+xml;base64,${contact.avatarImage}`}
                    alt=""
                  />
                </div>
                <div className="username">
                  <h3>{contact.username}</h3>
                </div>
              </div>
            ))}
            {groups != null && groups != [] ? (
              groups.map((group, index) => (
                <div
                  key={group._id}
                  className={`contact ${
                    currentSelected === group._id ? "selected" : ""
                  }`}
                  onClick={() => changeCurrentChat(index, group, true)}
                >
                  <div className="avatar">
                    {/* Render group avatar */}
                    <img src={groupAvatarUrl} alt="" />
                  </div>
                  <div className="username">
                    <h3>{group.name}</h3>
                  </div>
                </div>
              ))
            ) : (
              <></>
            )}
          </div>
          <div className="current-user">
            <div className="avatar">
              <img
                src={`data:image/svg+xml;base64,${currentUserImage}`}
                alt="avatar"
              />
            </div>
            <div className="username">
              <h2>{currentUserName}</h2>
            </div>
          </div>
        </Container>
      )}
    </>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 75% 15%;
  overflow: hidden;
  background-color: #080420;
  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    img {
      height: 2rem;
    }
    .icon {
      color: white;
      cursor: pointer;
    }
    h3 {
      color: white;
      text-transform: uppercase;
    }
  }
  .contacts {
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    gap: 0.8rem;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #040e42;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .contact {
      background: radial-gradient(circle at top right, #002a80, transparent), radial-gradient(circle at bottom left, #006880, transparent);
      min-height: 5rem;
      cursor: pointer;
      width: 90%;
      border-radius: 0.2rem;
      padding: 0.4rem;
      display: flex;
      gap: 1rem;
      align-items: center;
      transition: 0.5s ease-in-out;
      .avatar {
        img {
          height: 3rem;
        }
      }
      .username {
        h3 {
          color: white;
        }
      }
    }
    .selected {
      background-color: #0c2ee5;
    }
  }

  .current-user {
    background: #07197bcc;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    .avatar {
      img {
        height: 4rem;
        max-inline-size: 100%;
      }
    }
    .username {
      h2 {
        color: white;
      }
    }
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      gap: 0.5rem;
      .username {
        h2 {
          font-size: 1rem;
        }
      }
    }
  }
`;

const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;

  .modal {
    background-color: white;
    padding: 2rem;
    border-radius: 0.5rem;

    h3 {
      margin-bottom: 1rem;
    }

    input {
      width: 100%;
      padding: 0.5rem;
      margin-bottom: 1rem;
      border-radius: 0.3rem;
      border: 1px solid #ccc;
    }

    .contact-list {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .contact {
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.3rem;
      background-color: #f2f2f2;
      transition: background-color 0.3s ease;

      &.selected {
        background-color: #4caf50;
        color: white;
      }
    }

    button {
      padding: 0.5rem 1rem;
      background-image: radial-gradient(circle at top right, #002a80, transparent), radial-gradient(circle at bottom left, #006880, transparent);
      color: white;
      border: none;
      margin-right: .5rem;
      border-radius: 0.3rem;
      cursor: pointer;
      transition: background-color 0.3s ease;

      &:hover {
        background-color: #45a049;
      }
    }
  }
`;
