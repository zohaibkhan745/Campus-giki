const fs = require('fs');

const onErrorBlock = 
  const onError = () => {
    setTimeout(() => {
      const firstError = document.querySelector('.error-text');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };
;

function fixFile(file) {
  let c = fs.readFileSync(file, 'utf8');
  
  // Insert onError before return (
  c = c.replace(/return \(\s*<div className="min-h-screen/g, onErrorBlock + '\  return (\n    <div className="min-h-screen');
  
  // CreateEventPage: handleSubmit((data) => handlePublish(data, true)) -> handleSubmit((data) => handlePublish(data, true), onError)
  c = c.replace(/handleSubmit\(\(data\) => handlePublish\(data, true\)\)/g, 'handleSubmit((data) => handlePublish(data, true), onError)');
  
  // EditEventPage: handleSubmit((data) => onSubmit(data, false))
  c = c.replace(/handleSubmit\(\(data\) => onSubmit\(data, false\)\)/g, 'handleSubmit((data) => onSubmit(data, false), onError)');
  
  // EditEventPage: handleSubmit((data) => onSubmit(data, true))
  c = c.replace(/handleSubmit\(\(data\) => onSubmit\(data, true\)\)/g, 'handleSubmit((data) => onSubmit(data, true), onError)');

  fs.writeFileSync(file, c);
}

fixFile('client/src/pages/events/CreateEventPage.tsx');
fixFile('client/src/pages/events/EditEventPage.tsx');
