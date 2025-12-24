const LoginHeader = ({ logo, onSignUp }) => {
  return (
    <header className="p-4 bg-brand flex justify-between items-center">
      {/* Left side: Logo */}
      <div className="flex items-center">
        <div className="flex items-center space-x-3">
          <img
            src={logo}
            alt="1Pass Logo"
            className="h-10 w-10 object-contain rounded-lg"
          />
        </div>
      </div>

      {/* Right side: Signup Button */}
      <button
        type="button"
        onClick={onSignUp}
        className="px-4 py-2 bg-white text-brand rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
      >
        Sign up
      </button>
    </header>
  );
};

export default LoginHeader;
