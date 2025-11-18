import React from 'react';
import { User } from '../types';

type Props = {
  user: User;
  onClick?: () => void;
};

export default function UserCard({ user, onClick }: Props) {
  return (
    <div className="p-4 border rounded shadow hover:bg-gray-100 cursor-pointer flex items-center" onClick={onClick}>
      <img src={user.avatar || '/default-avatar.png'} alt={user.name} className="w-10 h-10 rounded-full mr-3" />
      <div>
        <div className="font-semibold">{user.name}</div>
        <div className="text-xs text-gray-500">ID: {user.id}</div>
      </div>
    </div>
  );
}
