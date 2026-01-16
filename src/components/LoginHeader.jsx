const LoginHeader = ({ logo }) => {
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
    </header>
  );
};

export default LoginHeader;
