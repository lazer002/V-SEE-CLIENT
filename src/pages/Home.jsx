
import axios from 'axios';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
const socket = io('http://localhost:9999');
import debounce from 'lodash.debounce'
import { RiSendPlaneFill, RiEmojiStickerFill, RiAttachment2, RiVideoAddFill,RiMessage3Line, RiUserAddLine, RiGroupLine, RiPieChartLine,RiCheckFill, RiCloseFill } from 'react-icons/ri';
import { FiPhoneCall } from "react-icons/fi";
import { HiDotsVertical } from "react-icons/hi";
import pro from '/images/profile.jpeg';
import EmojiPicker from 'emoji-picker-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Home() {




  const [user, setUser] = useState([]);
  const [singleUser, setSingleUser] = useState({});
  const [message, setMessage] = useState([]);
  const [mssg, setMssg] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionUser, setSessionUser] = useState('');
  const token = localStorage.getItem('token');
  const [results, setResults] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
// firebase
const [selectedFile, setSelectedFile] = useState('');
// firebase
  const chatBoxRef = useRef(null);
  const attFileRef = useRef(null);
  const [activeTab, setActiveTab] = useState(1); 




  // ###############################  friend list ######################################


  const userdata = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://vsee.onrender.com/getuser', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data.data);
      setSessionUser(response.data.user)
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    userdata();
  }, []);

console.log(sessionUser.email,'sessionUsersessionUsersessionUser');

  // ###############################  chat  show ######################################


  const chatshow = async (e) => {

    const userId = e.target.id;


    setSelectedUserId(userId);

    socket.emit('joinRoom', userId);

    try {

      const response = await axios.post(
        'https://vsee.onrender.com/getmessage',
        { receiverId: userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSingleUser(response.data.userdata[0]);
      const allMessages = response.data.data.flatMap(chat => chat.messages);
      setMessage(allMessages);
    } catch (error) {
      console.log('Error fetching messages: ', error);
    }
  };

  useEffect(() => {
    socket.on('receiveMessage', (incomingMessage) => {
      if (incomingMessage.senderId !== sessionUser.user_id || incomingMessage.receiverId === selectedUserId) {
        setMessage(prevMessages => [...prevMessages, incomingMessage]);
      }
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [selectedUserId, sessionUser.user_id]);


  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const options = {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleTimeString('en-US', options);
  };




  // ###############################  chat send ######################################


  const chatsend = (e) => {
    e.preventDefault();

    if (selectedUserId) {
      try {
        const newMessage = {
          content: mssg,
          receiverId: selectedUserId,
          senderId: sessionUser.user_id,
          fileUrl:selectedFile,
          timestamp: new Date(),
        };

        console.log('newMessage: ', newMessage);
        socket.emit('sendMessage', newMessage);


        setMssg('');

      } catch (error) {
        console.log('Error sending message: ', error);
        alert('Failed to send message. Please try again.');
      }
    } else {
      alert('Please select a user to chat with.');
    }
  };


  useEffect(() => {
    chatBoxRef.current?.scrollTo(0, chatBoxRef.current.scrollHeight);
  }, [message]);



  // #############################  search friend ######################
  // const debouncedSearch = useCallback(debounce((input) => addSearch(input), 300), []);

  const addSearch = async (e) => {
    const userkey = e.target.value
    debouncedAddSearch(userkey);
  }

  const debouncedAddSearch = useCallback(
    debounce(async (userkey) => {
      try {
        if (userkey.trim() === '') {
          setResults([]);
          return;
        }
        const response = await axios.post(
          'https://vsee.onrender.com/searchfriend',
          { userkey },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setResults(response.data.data);
      } catch (error) {
        console.error('Error searching for users:', error);
        setResults([]);
      }
    }, 1000),
    []
  );



  // ###############################  add friend ######################################

  const addfriend = async (e) => {
    const { id, action } = e.currentTarget; 
    const userId = id.addfrnd;
    
    try {
      const response = await axios.post(
        'http://localhost:9999/addfriend', // Same endpoint for both actions
        { userId, action }, // Pass action in request body
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const responseMessage = response.data.msg;
  
      // Update UI based on API response
      if (responseMessage === 'already') {
        console.log('Friend request already sent, changing button to Cancel');
        // Handle UI to show "Cancel" if already sent
      } else if (responseMessage === 'request canceled') {
        console.log('Friend request canceled, changing button to Add');
        // Handle UI to revert back to "Add" button
      } else if (responseMessage === 'request sent') {
        console.log('Friend request sent successfully');
        // Handle UI to show "Cancel" button
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };


  const onEmojiClick = (emojiObject) => {
    setMssg((prevMssg) => prevMssg + emojiObject.emoji);
    setShowPicker(false);
  };;



  // firebase ###############################################

  const uplaodfile = ()=>{
    if (attFileRef.current && attFileRef.current.files.length > 0) {
      setSelectedFile(attFileRef.current.files[0]);
    }
  }


  return (
    <>
      <div className="h-screen overflow-hidden">
        <div className="flex py-4 border sticky top-0 z-10 bg-blue-50 shadow-md">
          <div className="w-1/4 text-center">
            <div className="relative">
              <input
                type="text"
                onChange={addSearch}
                placeholder="Search for friends"
                className="p-2 w-10/12 rounded-lg shadow-sm"
              />

              <div className="absolute z-10 w-full max-w-md bg-white shadow-lg rounded-lg">
         {results.map((user) => (
  <div
    key={user.user_id}
    className="flex items-center justify-between bg-blue-50 hover:bg-blue-100 border-b border-blue-200 py-3 px-4 rounded-lg mb-2 transition duration-200 ease-in-out"
  >
    <div className="text-gray-800 font-medium">{user.username}</div>
    <div className="flex space-x-3">
      {user.friend_requests.includes(sessionUser.user_id) ? (
        <button
          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-md transition duration-200 ease-in-out"
          onClick={() => cancelFriendRequest(user.user_id)}
        >
          <RiCloseFill className="h-5 w-5" />
        </button>
      ) : (
        <button
          className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow-md transition duration-200 ease-in-out"
          onClick={addfriend}
        >
          <RiCheckFill className="h-5 w-5" />
        </button>
      )}
    </div>
  </div>
))}

              </div>
            </div>
          </div>

          <div className="w-3/4 flex justify-between">
            <div className="chatuser px-5">
              {singleUser.username ? (
                <Link to={`/user/${singleUser.username}/${singleUser._id}`}>
                  <div className="flex">
                    <img
                      src={singleUser.Profile ? `https://vsee.onrender.com/${singleUser.Profile}` : pro}
                      alt=""
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="px-3 text-2xl text-blue-500 font-medium">{singleUser.username}</div>
                  </div>
                </Link>
              ) : (
                ""
              )}
            </div>

            <div className={`flex justify-end gap-7 text-3xl px-3 text-blue-500 ${selectedUserId ? "" : "hidden"}`}>
              <FiPhoneCall />
              <RiVideoAddFill />
              <HiDotsVertical />
            </div>
          </div>
        </div>

        <div className="flex">
          <div className="w-16 bg-gray-200 p-4 flex flex-col items-center border-r">
            <div className={`p-4 ${activeTab === 1 ? "bg-blue-400 text-white" : "text-gray-600"}`} onClick={() => setActiveTab(1)}>
              <RiMessage3Line size={24} />
            </div>
            <div className={`p-4 ${activeTab === 2 ? "bg-blue-400 text-white" : "text-gray-600"}`} onClick={() => setActiveTab(2)}>
              <RiUserAddLine size={24} />
            </div>
            <div className={`p-4 ${activeTab === 3 ? "bg-blue-400 text-white" : "text-gray-600"}`} onClick={() => setActiveTab(3)}>
              <RiGroupLine size={24} />
            </div>
            <div className={`p-4 ${activeTab === 4 ? "bg-blue-400 text-white" : "text-gray-600"}`} onClick={() => setActiveTab(4)}>
              <RiPieChartLine size={24} />
            </div>
            <Link to={`/user/${sessionUser.email}/${sessionUser._id}`}>
              <img src={pro} className="h-9 w-9 rounded-full border border-gray-500 fixed bottom-5 left-4" />
            </Link>
          </div>

          <div className="flex-1 flex flex-col h-screen">
            {activeTab === 1 && (
              <div className="flex border border-fuchsia-900 h-full">
                <div className="w-1/4 bg-blue-100 p-2 border-blue-300 border-r h-full overflow-y-auto">
                  {loading ? (
                    <div>Loading...</div>
                  ) : error ? (
                    <div>{error}</div>
                  ) : user.length === 0 ? (
                    <div className="flex justify-center items-center h-full">
                      <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">Add Friend</button>
                    </div>
                  ) : (
                    user.map((item) => (
                      <div
                        className="py-5 ps-5 my-2 rounded-lg bg-blue-300 border-b border-blue-50 shadow-sm flex"
                        key={item.user_id}
                        id={item.user_id}
                        onClick={chatshow}
                      >
                        <img
                          src={item.Profile ? `https://vsee.onrender.com/${item.Profile}` : pro}
                          alt=""
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="font-medium text-gray-800 ps-4 text-lg">{item.username}</div>
                      </div>
                    ))
                  )}
                </div>

                <div className="chatbody w-3/4 bg-blue-100 relative flex flex-col h-full">
                  <div className="chatbox overflow-y-auto flex-1" ref={chatBoxRef}>
                    {message.map((mg, i) => {
                      const isNewBlock = i === 0 || message[i - 1].senderId !== mg.senderId;
                      const formattedTime = formatTimestamp(mg.timestamp);

                      return (
                        <div key={i} className={`flex ${mg.senderId === selectedUserId ? "justify-start" : "justify-end"} gap-2`}>
                          {isNewBlock && mg.senderId === selectedUserId ? (
                            <img
                              src={singleUser.Profile ? `https://vsee.onrender.com/${singleUser.Profile}` : pro}
                              alt="User Profile"
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10"></div>
                          )}
                          <div className="flex flex-col">
                            <div className={`${mg.senderId === selectedUserId ? "bg-slate-50 text-gray-700" : "bg-blue-400 text-white me-2"} ms-1 mt-1 mb-2 p-3 rounded-lg shadow-sm relative pe-12`}>
                              {mg.content}
                              <span className="text-[9px] absolute right-2 bottom-[-1px]">{formattedTime}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className={`chatsend flex justify-start gap-5 p-5 bg-white ${selectedUserId ? "block" : "hidden"}`}>
                    <input type="file" name="attFile" id="" className="hidden" ref={attFileRef} onChange={uplaodfile} />
                    <button>
                      <RiAttachment2 className="text-3xl mt-1 text-blue-500" onClick={() => attFileRef.current.click()} />
                    </button>
                    <input
                      type="text"
                      name="mssg"
                      value={mssg}
                      id="mssg"
                      className="w-11/12 p-3 rounded-lg"
                      placeholder="Type your message and press enter"
                      onChange={(e) => setMssg(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          chatsend(e);
                        }
                      }}
                    />
                    <div className="flex px-2 pt-1 justify-evenly">
                      <button>
                        <RiSendPlaneFill className="text-4xl mx-2 text-blue-500" onClick={chatsend} />
                      </button>
                      <button>
                        <RiEmojiStickerFill className="text-4xl mx-2 text-blue-500" onClick={() => setShowPicker((val) => !val)} />
                      </button>
                    </div>
                  </div>

                  {showPicker && (
                    <div className="emoji-picker-container">
                      <EmojiPicker onEmojiClick={onEmojiClick} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div className="p-4 h-full overflow-y-auto">
                <div className="w-full">
                  {results.map((user) => (
                    <div
                      key={user.user_id}
                      className="flex items-center justify-between bg-blue-50 hover:bg-blue-100 border-b border-blue-200 py-3 px-4 rounded-lg mb-2 transition duration-200 ease-in-out"
                    >
                      <div className="text-gray-800 font-medium">{user.username}</div>
                      <div className="flex space-x-3">
                        <button
                          className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow-md transition duration-200 ease-in-out"
                          onClick={addfriend}
                          id={user.user_id}
                        >
                          <RiCheckFill className="h-5 w-5" />
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-md transition duration-200 ease-in-out"
                          id={user.user_id}
                        >
                          <RiCloseFill className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>


        </div>
      </div>
      <ToastContainer/>
    </>
  );
}

export default Home;

// 
