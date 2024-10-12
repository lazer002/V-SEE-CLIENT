import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RiCheckFill, RiCloseFill } from 'react-icons/ri';
import { toast } from 'react-toastify';

const FriendTabs = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [fromUserDetails, setFromUserDetails] = useState([]);
  const [friends, setFriends] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const response = await axios.get(
          'https://vsee.onrender.com/friend-requests',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setFromUserDetails(response.data.Frequests);
        toast(response.data.msg);
      } catch (error) {
        toast('An error occurred. Please try again.');
      }
    };

    const fetchFriends = async () => {
      try {
        const response = await axios.get(
          'https://vsee.onrender.com/friends',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setFriends(response.data.friends);
        toast(response.data.msg);
      } catch (error) {
        toast('An error occurred. Please try again.');
      }
    };

    if (activeTab === 'requests') {
      fetchFriendRequests();
    } else if (activeTab === 'friends') {
      fetchFriends();
    }
  }, [activeTab, token]);

  const acceptFriendRequest = async (fromUserId) => {
  
console.log(fromUserId,'fromUserId');
    try {
      const response = await axios.post('https://vsee.onrender.com/acceptfriend', {
        from_user_id: fromUserId
      } , {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success(response.data.msg);
      // Update UI state to reflect acceptance
      setFromUserDetails(prev => prev.filter(user => user.from_user !== fromUserId));
    } catch (error) {
      toast.error('Failed to accept friend request');
    }
  };

  const rejectFriendRequest = async (fromUserId) => {
    const userId = localStorage.getItem('user_id'); // Get current user's ID

    try {
      const response = await axios.post('https://vsee.onrender.com/rejectfriend', {
        from_user_id: fromUserId
      } , {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success(response.data.msg);
      // Update UI state to reflect rejection
      setFromUserDetails(prev => prev.filter(user => user.from_user !== fromUserId));
    } catch (error) {
      toast.error('Failed to reject friend request');
    }
  };
console.log(fromUserDetails,'fromUserDetails');
  return (
    <div className="w-full mx-auto my-8 p-4 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between mb-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 font-semibold ${activeTab === 'requests' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600'}`}
        >
          Friend Requests
        </button>
        <button
          onClick={() => setActiveTab('friends')}
          className={`px-4 py-2 font-semibold ${activeTab === 'friends' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600'}`}
        >
          Friends
        </button>
      </div>

      {activeTab === 'requests' && (
        <>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Friend Requests</h2>
          {fromUserDetails.length > 0 ? (
            <ul>
              {fromUserDetails.map((user, index) => (
                <li key={index} className="flex justify-between items-center py-4 border-b border-gray-200">
                  <div>
                    <p className="text-lg font-medium text-gray-700"><strong>Username:</strong> {user?.username || 'N/A'}</p>
                    <p className="text-sm text-gray-500"><strong>Email:</strong> {user?.email || 'N/A'}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => acceptFriendRequest(user.user_id)}
                      className="flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-full hover:bg-green-600"
                    >
                      <RiCheckFill size={24} />
                    </button>
                    <button
                      onClick={() => rejectFriendRequest(user.user_id)}
                      className="flex items-center justify-center w-10 h-10 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <RiCloseFill size={24} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No friend requests found.</p>
          )}
        </>
      )}

      {activeTab === 'friends' && (
        <>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Friends</h2>
          {friends.length > 0 ? (
            <ul>
              {friends.map((friend, index) => (
                <li key={index} className="flex justify-between items-center py-4 border-b border-gray-200">
                  <div>
                    <p className="text-lg font-medium text-gray-700"><strong>Username:</strong> {friend?.username || 'N/A'}</p>
                    <p className="text-sm text-gray-500"><strong>Email:</strong> {friend?.email || 'N/A'}</p>
                  </div>
                  <button
                    onClick={() => removeFriend(friend.user_id)} // Implement removeFriend function as needed
                    className="flex items-center justify-center w-10 h-10 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No friends found.</p>
          )}
        </>
      )}
    </div>
  );
};

export default FriendTabs;
