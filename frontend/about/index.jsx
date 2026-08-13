import React from 'react';
import MainLayout from '../../layouts/MainLayout';

const PageName = () => {
  return (
    <MainLayout>
      <div className="container" style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Page Title</h1>
        <p>This is the {pageName} page. Add your content here.</p>
      </div>
    </MainLayout>
  );
};

export default PageName;