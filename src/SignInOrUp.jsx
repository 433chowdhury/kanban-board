import { useState } from "react";
import Button from "./components/Button";
import Input from "./components/Input";
import TextButton from "./components/TextButton";

function SignInOrUp({
  user,
  loginPhase,
  setLoginPhase,
  setUser,
  className,
  handleNotification,
  handleLogout,
  ...rest
}) {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loginPhase === "Sign In") {
      try {
        const response = await fetch("http://localhost:3001/signin/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });
        const loggedInUser = await response.json();
        setUser(loggedInUser);
        setLoginPhase("");
        localStorage.setItem("user", JSON.stringify(loggedInUser));
        handleNotification("Successful!");
      } catch (err) {
        if (err) handleNotification("Unsuccessful!");
      }
    }
    if (loginPhase === "Sign Up") {
      try {
        const response = await fetch("http://localhost:3001/signup/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first_name: firstname,
            last_name: lastname,
            email,
            password,
          }),
        });
        if (response.status === 201) handleNotification(await response.text());
        setLoginPhase("Sign In");
      } catch (err) {
        if (err) handleNotification("Unsuccessful!");
      }
    }
  };

  return (
    <div className={"absolute right-5 flex flex-col gap-5 " + className}>
      <h2 className="text-xl min-w-[267px]">
        {user ? (
          <>
            Welcome {user.first_name}
            <TextButton className="ml-4" onClick={handleLogout}>
              Logout
            </TextButton>
          </>
        ) : (
          <TextButton
            className="underline"
            onClick={() =>
              setLoginPhase((prevData) =>
                prevData === "Sign Up"
                  ? "Sign In"
                  : prevData === ""
                  ? "Sign In"
                  : ""
              )
            }
          >
            {(loginPhase === "Sign In" || loginPhase === "") && "Sign In"}
            {loginPhase === "Sign Up" && "< Back"}
          </TextButton>
        )}
      </h2>
      {loginPhase !== "" && !user && (
        <form
          onSubmit={handleSubmit}
          {...rest}
          className={"flex flex-col gap-5 "}
        >
          {loginPhase === "Sign Up" && (
            <>
              <Input
                className="!text-base placeholder:!text-base !py-1 !px-3"
                placeholder="First Name"
                type="text"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
              />
              <Input
                className="!text-base placeholder:!text-base !py-1 !px-3"
                placeholder="Last Name"
                type="text"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
              />
            </>
          )}
          <Input
            className="!text-base placeholder:!text-base !py-1 !px-3"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            className="!text-base placeholder:!text-base !py-1 !px-3"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {loginPhase === "Sign In" && (
            <p className="text-xs">
              Don't have an account?{" "}
              <TextButton
                className="ml-1 text-sm font-medium text-accent"
                onClick={(e) => setLoginPhase("Sign Up")}
              >
                Sign Up
              </TextButton>
            </p>
          )}
          <Button className="mt-4" type="submit ">
            SUBMIT
          </Button>
        </form>
      )}
    </div>
  );
}

export default SignInOrUp;
