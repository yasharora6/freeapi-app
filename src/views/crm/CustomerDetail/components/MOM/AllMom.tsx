import { Button, Card, Dropdown, Input } from '@/components/ui';
import React, { useContext, useEffect, useState } from 'react';
import { MomData, projectId } from './data';
import { useLocation } from 'react-router-dom';
import { apiGetCrmProjectsMom } from '@/services/CrmService';
import { useMomContext } from '../../store/MomContext';
import { BsThreeDotsVertical } from 'react-icons/bs';

interface Attendees {
  client_name: string[];
  [key: string]: string | string[];
}

interface LeadDataItem {
  mom_id: string;
  meetingdate: string;
  location: string;
  attendees: Attendees;
  remark: string;
  important_note: string;
}

interface File {
  fileUrl: string;
  fileName:string
  
}

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [highlightedText, setHighlightedText] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const { leadData, client } = useMomContext();

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    setSearchInput(term);
    setHighlightedText(term); 
  };
  

  const handleSearchButtonClick = () => {
    setHighlightedText(searchTerm);
  };
  

  interface QueryParams {
    id: string;
    project_id: string;
    mom: string;
  }
  type Files={
      fileUrl: string;
    }
  

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // Create an object to store and map the query parameters
  const allQueryParams: QueryParams = {
    id: queryParams.get('id') || '',
    project_id: queryParams.get('project_id') || '',
    mom: queryParams.get('type') || '',
  };

  

  const filteredMomData = leadData
  ? leadData.filter((item) => {
      const searchIn = (str: string | undefined): boolean => {
        if (str === undefined) {
          return false;
        }
        return str.toLowerCase().includes(searchTerm.toLowerCase());
      };

      return (
        searchIn(item.mom_id) ||
        searchIn(item.meetingdate) ||
        searchIn(item.location) ||
        (Array.isArray(item.attendees.client_name) && searchIn(item.attendees.client_name.join(', '))) ||
        searchIn(item.remark) ||
        searchIn(item.imaportant_note) ||
        (item.attendees && Object.entries(item.attendees).some(([key, value]) => searchIn(value)))
      );
    })
  : [];


  const highlightText = (text: string, isDate: boolean = false): JSX.Element => {
    if (!highlightedText.trim()) {
      return <>{text}</>;
    }
  
    const regex = new RegExp(`(${highlightedText})`, 'gi');
    const parts = text ? text.split(regex) : [];

    
  
    return (
        <>
            {parts.map((part, index) =>
                regex.test(part) ? (
                    <span
                        key={index}
                        className=" bg-[#FFFF00] bg-opacity-100 text-black rounded-md"
                    >
                        {isDate && regex.test(part) && text
                            ? new Date(part).toISOString().split('T')[0]
                            : part}
                    </span>
                ) : (
                    <span key={index}>{part}</span>
                ),
            )}
        </>
    )
  };
  

  
  
  const getNames = (names: string[] | string) => {
    if (Array.isArray(names)) {
      return names.join(', ');
    } else if (typeof names === 'string') {
      return names;
    }
    return 'Invalid format';
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = String(date.getUTCDate()).padStart(2, '0')
    const month = String(date.getUTCMonth() + 1).padStart(2, '0') // Months are 0-based in JavaScript
    const year = date.getUTCFullYear()

    return `${day}-${month}-${year}`
}

const Toggle= <BsThreeDotsVertical className='font-semibold text-xl cursor-pointer'/>
  return (
    <div className="">
      <div className="flex justify-between ">
        <h3>MOM Data</h3>
        <Input
          type="text"
          placeholder="Search..."
          value={searchInput}
          className=" w-1/5"
          onChange={handleSearchInputChange}
        />
       

      </div>
      <ul>
      {filteredMomData.length > 0 ? (
    filteredMomData.map((rowData: any) => (
      <Card className='my-6'>
      <main className="pb-10 ">
      <div className=" dark:bg-gray-950 rounded-lg p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Meeting Details</h2>
            <span>
            <Dropdown renderTitle={Toggle} placement='bottom-end'>
            <a href={`https://colonelz.test.psi.initz.run/v1/api/admin/generate/pdf?project_id=${projectId}&mom_id=${rowData.mom_id}`} target='_blank' rel='noreferrer' 
                        
                        >
                <Dropdown.Item eventKey="a">View MOM</Dropdown.Item>
                </a>
            </Dropdown></span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 dark:text-gray-400 font-semibold">Location</p>
              <p>{highlightText(rowData.location)}</p>
              <p className="text-gray-500 dark:text-gray-400 font-semibold">Date</p>
              <p>{highlightText(formatDate(rowData.meetingdate))}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 font-semibold">Attendees</p>
              <ul className="space-y-1">
                <li><span className='font-semibold'>Client:</span> {highlightText(getNames(rowData.attendees.client_name))} </li>
                <li><span className='font-semibold'>Organizer:</span> {highlightText(getNames(rowData.attendees.organisor))} </li>
                <li><span className='font-semibold'>Designer:</span> {highlightText(getNames(rowData.attendees.designer))} </li>
                <li><span className='font-semibold'>Others:</span> {highlightText(getNames(rowData.attendees.attendees))} </li>
              </ul>
            </div>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 font-semibold">Remarks</p>
            <p>
              {highlightText(rowData.remark)}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 font-semibold">Files</p>
            <div className="space-y-2">
              {rowData.files.map((file:File)=>(
              <a className="flex items-center gap-2 text-blue-600 hover:underline" href={file.fileUrl} target='_blank'>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                {file.fileName.length > 20 ? `${file.fileName.substring(0, 20)}...` : file.fileName}
              </a>))}
           
            </div>
          </div>
        </div>
      </div>
    </main>
    </Card>
        ))) : (
          <div style={{ textAlign: 'center' }}>No Mom Data</div>
      )}
      </ul>
    </div>
  );
};

export default App;