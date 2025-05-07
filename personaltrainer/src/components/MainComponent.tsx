import { useState } from "react";
import TrainingList from "../TrainingList";
import Customers from "../Customers";
import Calendar from "../Calendar";



export default function MainComponent() {
  const [activeTab, setActiveTab] = useState(1);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const switchTab = (e: any) => {
    setActiveTab(parseInt(e.target.id));
  }

  return (
    <>
      <div className="container my-4">

        {/***** Tab navigation *****/}
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <a id="1" className={"nav-link " + (activeTab === 1 ? "active" : "")} onClick={e => switchTab(e)}>Training sessions</a>
          </li>
          <li className="nav-item">
            <a id="2" className={"nav-link " + (activeTab === 2 ? "active" : "")} onClick={e => switchTab(e)}>Customers</a>
          </li>
          <li className="nav-item">
            <a id="3" className={"nav-link " + (activeTab === 3 ? "active" : "")} onClick={e => switchTab(e)}>Calendar</a>
          </li>
        </ul>

        {/***** Tab 1 - Treenit *****/}
        <div className={"container " + (activeTab === 1 ? "" : "display-none")}>
          <TrainingList />
        </div>


        {/***** Tab 2 - Asiakkaat *****/}
        <div className={"container " + (activeTab === 2 ? "" : "display-none")}>
          <Customers />
        </div>

       {/***** Tab 3 - Kalenteri *****/}
        <div className={"container " + (activeTab === 3 ? "" : "display-none")}>
          <Calendar />
        </div>


      </div>
    </>
  )
}