import React from 'react';
import ReactMarkdown from 'react-markdown';
import privacyPolicyMd from '../../docs/PRIVACY_POLICY.md?raw';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="container mx-auto p-8 max-w-[800px] prose dark:prose-invert">
      <ReactMarkdown>{privacyPolicyMd}</ReactMarkdown>
    </div>
  );
};

export default PrivacyPolicyPage;
