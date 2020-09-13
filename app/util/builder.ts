import fs from 'fs';

export class Builder {
 buildTemplate = (filePath, params?: Map<string, string>) => {
  let template = '';

  try {
   template = fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
   console.error('An error occurred while building template: ' + err);
  }

  if (params != undefined) {
   params.forEach((value: string, key: string) => {
    template = template.replace(key, value);
   });
  }
  console.log('Successfully build template: \n' + template);

  return template;
 }

 buildUrl = (url, params) => {
  let generatedUrl = url;
  for (let i = 0; i < params.length; i++) {
   let param = params[i];
   generatedUrl = generatedUrl.replace('{{' + i + '}}', param);
  }
  return generatedUrl;
 }
}
