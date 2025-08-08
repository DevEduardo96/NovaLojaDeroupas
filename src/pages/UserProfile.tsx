import React from "react";

interface UserProfileProps {
  user: any;
  onLogout: () => void;
  onBack: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
  user,
  onLogout,
  onBack,
}) => {
  if (!user) return null;

  const { email, user_metadata } = user;
  const fullName = user_metadata?.full_name || "";
  const avatarUrl = user_metadata?.avatar_url || "";

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <button onClick={onBack} className="mb-4 text-blue-600 hover:underline">
        &larr; Voltar
      </button>

      <div className="flex flex-col items-center">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover mb-4"
          />
        ) : (
          <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center mb-4">
            <span className="text-gray-600 text-3xl">👤</span>
          </div>
        )}

        <h2 className="text-xl font-semibold mb-2">{fullName || "Usuário"}</h2>
        <p className="text-gray-600 mb-6">{email}</p>

        <button
          onClick={onLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Sair
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
