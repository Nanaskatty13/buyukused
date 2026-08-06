import { Navigate, Outlet } from "react-router-dom";


const AdminRoute = () => {

    const user = JSON.parse(
        localStorage.getItem("user")
    );


    if(!user){

        return <Navigate to="/login" />;

    }


    if(user.role !== "admin"){

        return <Navigate to="/" />;

    }


    return <Outlet />;

};


export default AdminRoute;