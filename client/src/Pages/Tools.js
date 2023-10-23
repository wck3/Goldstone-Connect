import React from "react";
import './Tools.css';
import axios from 'axios';
import {useState, useEffect } from "react";
import Pagination_Pages from "../Components/pagination_pgs";

async function get_tools(){
    axios.defaults.withCredentials = true;
    try{
        const response = await axios.get("http://localhost:4000/tools/get-tools");
        if(response){
            return response.data
        }
    } catch(err){
        console.log(err);
    }
}; 

export default function Tools(){
    const [data, setData] = useState();
    const [postsPerPage] = useState(3);
    const [paginationInfo, setPaginationInfo] = useState({});

    useEffect(() => {
        async function fetchToolsAndSetState() {
            try {
                // fetch all tools to display
                const result = await get_tools();
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
            
            <div className="tool-sections">
            {data?.map((tool) => (
                
                <div key={tool.category} className="tool-category">
                    <h1>{tool.category}</h1>
                    <div className="tool-info">
                        <ul>
                            {/* display paginated by using individual currently active page and desired postsPerPage*/}
                            {tool.info.slice(paginationInfo[tool.category].currentPage * postsPerPage - postsPerPage, paginationInfo[tool.category].currentPage * postsPerPage).map((data) => (
                                <li key={data.id}>
                                    <h2><a href={data.link} target="_blank" rel="noreferrer noopener">{data.title}</a></h2>
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
            ))}
            </div>
        </div>
    );
};

