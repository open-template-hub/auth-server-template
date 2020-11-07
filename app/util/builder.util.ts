import fs from 'fs';
import { debugLog } from '../services/debug-log.service';

export class Builder {
  buildTemplateFromFile = (filePath, params?: Map<string, string>) => {
    let template = '';

    try {
      template = fs.readFileSync(filePath, 'utf-8');
    } catch (err) {
      console.error(err);
    }

    if (params) {
      params.forEach((value: string, key: string) => {
        template = template.replace(key, value);
      });
    }
    debugLog('Successfully build template: ' + filePath);

    return template;
  };

  buildUrl = (url, params) => {
    let generatedUrl = url;
    for (let i = 0; i < params.length; i++) {
      let param = params[i];
      generatedUrl = generatedUrl.replace('{{' + i + '}}', param);
    }
    return generatedUrl;
  };
}
