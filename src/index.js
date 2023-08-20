import React from 'react';
import ReactDOM from 'react-dom';
import PageMain from "./pages/PageMain"

try{
   ReactDOM.render(
      <React.StrictMode>
         <PageMain app_name={"fracto-inspector"}/>
      </React.StrictMode>,
      document.getElementById('root')
   );
} catch {
   debugger;
}
