const toAddress = "adr_bb8c6abf6bf2c612";

const back_tmpl = "tmpl_3cdf2f9422f2968";

// PropertiesService.getScriptProperties().setProperty("API_KEY", "test_7116a24dd8a038acadc7bbed8eff2c55168");

const API_KEY = PropertiesService.getScriptProperties().getProperty('API_KEY');

const emailBody = `<!DOCTYPE html>
<html>
  <head>
    <base target="_top">
  </head>
  <body>
    <p>Hi <?= name ?>, </p>
    <br />
    <p>Thank you for using the <a href="http://afscarizona.org/send-postcard/">ReFraming Justice Postcard Generator</a> to tell Arizona lawmakers why you support sentencing reform! Be sure to follow AFSC-Arizona on <a href="https://www.facebook.com/AFSCArizona">Facebook</a>, <a href="https://www.instagram.com/afscaz/">Instagram</a> & <a href="https://twitter.com/afscaz">Twitter</a> so you can help amplify our message and stay up-to-date on legislative developments.</p>
    <br />
    <p>Stay safe & stay strong!</p>
    <p>AFSC-Arizona | ReFraming Justice</p>
  </body>
</html>`