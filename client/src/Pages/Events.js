import React from "react";
import './Events.css';
import get_from from '../API/get_from.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLink } from "@fortawesome/free-solid-svg-icons";
import Loading from "../Components/loading";

import { useState, useEffect } from 'react';

export default function Events(){
    const[Events, setEvents] = useState();
    const api_url = process.env.REACT_APP_API_URL;
    
    // fetch events from basck end
    useEffect(() => {
        async function fetchEventsAndSetState() {
            try {
                // fetch all tools to display
                const result = await get_from(api_url + "events/get-events");
                setEvents(result);
            } catch (error) {
              console.error('Error fetching data:', error);
            }
        }
        fetchEventsAndSetState();
    // eslint-disable-next-line
    }, []);

   // ...

return (
    <div className="Events">
      <h1 className="pg-title">OUR UPCOMING EVENTS</h1>
      {Events !== undefined ? (
        <>
          {Events?.map((eBlock, index) => (
            <div key={eBlock.block_id} className={`event-block ${index % 2 === 0 ? 'even' : 'odd'}`}>
              <div className="block-img">
                <img loading="lazy" src={eBlock.img_path} alt={eBlock.headline} />
              </div>
              <div className="block-content">
                <h1>{eBlock.headline}</h1>
                <ul>
                  <li><h2>{eBlock.day} {eBlock.time}, {eBlock.location}</h2></li>
                  <li><p>{eBlock.description}</p></li>
                </ul>
              </div>
            </div>
          ))}
          <h1 className="pg-title link-calendar">
            <a href="https://drive.google.com/drive/folders/1mP9SfL0yKRX6_zzLqAQWvy4D9bFiZZy9">
              CLICK HERE FOR OUR MONTHLY CALENDAR <FontAwesomeIcon icon={faExternalLink} />
            </a>
          </h1>
        </>
      ) : (
        <Loading />
      )}
    </div>
  );
  
};
