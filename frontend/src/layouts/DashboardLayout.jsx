import { Outlet } from "react-router-dom";


function DashboardLayout(){

    return (

        <div>

            <h2>Dashboard</h2>

            <Outlet />

        </div>

    );

}


export default DashboardLayout;