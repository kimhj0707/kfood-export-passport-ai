import React from 'react';
import ReactMarkdown from 'react-markdown';
import termsOfServiceMd from '../../docs/TERMS_OF_SERVICE.md?raw';

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="container mx-auto p-8 max-w-[800px] prose dark:prose-invert">
      <ReactMarkdown>{termsOfServiceMd}</ReactMarkdown>
    </div>
  );
};

export default TermsOfServicePage;
