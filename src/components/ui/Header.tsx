import { Link } from "react-router";

export default function Header() {
  return (
    <header className="flex flex-row justify-center items-center space-x-3 min-h-16 w-full mx-auto p-2 sm:px-6 lg:p-4">
      <Link
        to="/"
        className="bg-primary-600 rounded-lg flex items-center justify-center"
      >
        <svg
          className="w-7 md:w-8 xl:w-9 h-7 md:h-8 xl:h-9 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          fill="#6a7282"
          viewBox="0 0 16 16"
        >
          <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M4.5 9a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1zM4 10.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m.5 2.5a.5.5 0 0 1 0-1h4a.5.5 0 0 1 0 1z" />
        </svg>
        <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-gray-500">
          Kube Credential System
        </h1>
      </Link>
    </header>
  );
}
