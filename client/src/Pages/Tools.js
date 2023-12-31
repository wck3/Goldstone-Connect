import React from "react";
import './Tools.css';
import axios from 'axios';
import {useState, useEffect } from "react";
import Pagination_Pages from "../Components/pagination_pgs";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLink } from "@fortawesome/free-solid-svg-icons";
import get_from from "../API/get_from";
import Loading from "../Components/loading";

export default function Tools(){
    const [data, setData] = useState();
    const [postsPerPage] = useState(3);
    const [paginationInfo, setPaginationInfo] = useState({});
    const api_url = process.env.REACT_APP_API_URL;
    // retrieve external tool links from backend
    useEffect(() => {
        async function fetchToolsAndSetState() {
            try {
                const result = await get_from(api_url + "tools/get-tools");

                setData(result);
                const paginationData = {};
                // set current page for each category of tool individually
                // allows for seperate pagination of each category
                result.forEach((tool) => {
                    paginationData[tool.category] = {
                        currentPage: 1,
                    };
                });
                setPaginationInfo(paginationData);
            } catch (error) {
              console.error('Error fetching data:', error);
            }
        }
        fetchToolsAndSetState();
    }, []);
       
    return(
       
        <div className="Tools">
            <h1 className="pg-title">EXTERNAL TOOLS</h1>
            {data !== undefined ? (
                data?.map((tool) => (
                
                <div key={tool.category} className="tool-category">
                    <h1>{tool.category}</h1>
                    <div className="tool-info">
                        <ul>
                            {/* display paginated by using individual currently active page and desired postsPerPage*/}
                            {tool.info.slice(paginationInfo[tool.category].currentPage * postsPerPage - postsPerPage, paginationInfo[tool.category].currentPage * postsPerPage).map((data) => (
                                <li key={data.id}>
                                    <h2>
                                        <a href={data.link} target="_blank" rel="noreferrer noopener">
                                            {data.title} <FontAwesomeIcon icon={faExternalLink} className="ext"/>
                                        </a>
                                    </h2>
                                    <p>{data.description}</p>
                                </li>
                            ))}
                         </ul>    
                        {/* update current page using setPaginationInfo state */}
                        <Pagination_Pages postsPerPage={postsPerPage} totalPosts={tool.info.length} 
                            paginate={(pageNumber) => {
                                const updatedPaginationInfo = { ...paginationInfo };
                                updatedPaginationInfo[tool.category].currentPage = pageNumber;
                                setPaginationInfo(updatedPaginationInfo);
                            }}
                        />
                    </div> 
                </div>
            )) ):(
                <Loading/>
            )}
            </div>
    
    );
};

