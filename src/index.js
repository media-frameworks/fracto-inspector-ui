import React from 'react';
import ReactDOM from 'react-dom/client';

import PageMain from "pages/PageMain";
import FractoIndexedTilesLoader from "./fracto/common/data/FractoIndexedTilesLoader";

const APP_NAME = 'fracto-inspector'
const page_main = <PageMain key={'page-main'} app_name={APP_NAME}/>

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
   <FractoIndexedTilesLoader
      app_name={APP_NAME}
      app_page={[page_main]}
   />
);

