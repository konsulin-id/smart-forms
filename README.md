<div align="center">
<h1>Smart Forms</h1>
<h3>An open source FHIR powered forms app built in React</h3>
<h4>
Powered by SMART on FHIR and Structured Data Capture, Smart Forms allow you to easily integrate forms into your existing healthcare system.
</h4>
<h3><a href="https://www.smartforms.io" target="_blank">Show me the app ➡️</a></h3>
<br/>
</div>

---
Smart Forms is a Typescript-based [React](https://reactjs.org/) forms web application currently ongoing development by [CSIRO's Australian e-Health Research Centre](https://aehrc.csiro.au/) as part of the Primary Care Data Quality project funded by the Australian Government Department of Health.

The web app is intended to demonstrate the use of [HL7 FHIR](https://hl7.org/fhir/) specifications, such as the [Questionnaire](https://hl7.org/fhir/questionnaire.html) and [QuestionnaireResponse](https://hl7.org/fhir/questionnaireresponse.html) resources, the Structured Data Capture (SDC) implementation guide, and most notably it leverages [SMART on FHIR capabilities](https://hl7.org/fhir/smart-app-launch/index.html) that allows the app to be launched by a primary care Clinical Management System (CMS) and capture standardised health check information for healthcare clients.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).


## Functionalities

**Smart Forms app**

| Functionality                    | Description                                                                                                                                                  | Resources                                                                                                                                                            | Showcase 🖼️ (Right click -> Open link in new tab)                                                                                                        |
|----------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| Form population                  | Populate FHIR clinical data into forms, removing the need to re-enter generic information every time a new form is created, allows reusability of data.      | [SDC Populate](https://hl7.org/fhir/uv/sdc/populate.html)                                                                                                            | [Population of patient details](assets/population-patient-details.png)</br>[Population of patient medical history](assets/population-medical-history.png) |
| Conditional rendering            | Render form items conditionally based on user decisions or pre-determined data.                                                                              | [Questionnaire EnableWhen](https://hl7.org/fhir/questionnaire-definitions.html#Questionnaire.item.enableWhen)                                                        | [Form tabs and items presented differently for patients of different age groups](assets/enablewhen-age-groups.png)                                        |
| Built-in calculations            | Perform calculations based on form item answers to produce a calculated result, e.g. BMI, CVD Risk Score.                                                    | [SDC Calculations](https://hl7.org/fhir/uv/sdc/behavior.html#calculations)                                                                                           | [Calculated BMI based on height and weight values](assets/calculation.png)                                                                                |
| ValueSet expansion               | Perform expansion of ValueSet resources via the Ontoserver $expand operation API within autocomplete, dropdown, radio button and checkbox fields.            | [ValueSet expand](https://hl7.org/fhir/OperationDefinition/ValueSet-expand)</br>[Ontoserver ValueSet API](https://ontoserver.csiro.au/docs/6/api-fhir-valueset.html) | [Ontoserver ValueSet Expansion in an Autocomplete component](assets/ontoserver-expand.png)                                                                |
| QuestionnaireResponse write-back | A form can either be saved as a draft or as final, which will compile the form answers into a QuestionnaireResponse resource and store it on the CMS server. | <div align="center">-</div>                                                                                                                                          | [List of responses in context of a patient](assets/responses.png)                                                                                         |
| Form preview                     | Generate a human-readable preview of the QuestionnaireResponse which can be viewed while filling in the form or after the form is saved.                     | <div align="center">-</div>                                                                                                                                          | [Human-readable form preview](assets/preview.png)                                                                                                         |                                                      |
| Generic form implementation      | The app is able to render any form as long as it conforms to the FHIR specification!                                                                         | <div align="center">-</div>                                                                                                                                          | [Rendering of an Australian absolute CVD Risk calculator questionnaire](assets/generic-form.png)                                                          |

NOTE: The patients featured in the screenshots are synthetic and do not represent any real people.

**Forms Server API**


| Functionality          | Description                                                                                                                                                                                                                                                                      | Resources                                                                                     |
|------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| Modular questionnaires | Allows a questionnaire to be composed of sub-questionnaires which allows for reusability of questionnaire components i.e. a single tab within a form with multiple tabs. Subquestionnaires can be "assembled" to form a complete questionnaire with the **$assemble** operation. | [SDC Modular questionnaires](https://hl7.org/fhir/uv/sdc/modular.html#modular-questionnaires) |


## Contents

1. The Smart Forms web app. Try it out here: https://www.smartforms.io/
2. Implemented operations from the [Structured Data Capture (SDC)](http://hl7.org/fhir/uv/sdc/) specification:
 - [$populate](https://hl7.org/fhir/uv/sdc/OperationDefinition/Questionnaire-populate)
 - [$assemble](https://hl7.org/fhir/uv/sdc/OperationDefinition/Questionnaire-assemble)

3. A Questionnaire-hosting Forms Server API which supports the $assemble operation. This API is It is built on the [HAPI-FHIR Starter Project](https://github.com/hapifhir/hapi-fhir-jpaserver-starter). The API is publicly available at https://api.smartforms.io.

## Usage

### Running on a SMART CMS client (the preferred way)

1. Open https://launch.smarthealthit.org/ (or your own SMART on FHIR enabled CMS) in a browser.
2. Set the **App Launch URL** at the bottom of the page as `https://www.smartforms.io/launch` and launch app.

![image](https://user-images.githubusercontent.com/52597778/223016492-882abdaf-33e9-4039-8c32-301c4cf58e91.png)

3. Alternatively, launch a specified questionnaire directly with `https://www.smartforms.io/launch?questionnaireUrl={questionnaire.url}`, with questionnaire.url being the absolute URI of the questionnaire: https://hl7.org/FHIR/questionnaire-definitions.html#Questionnaire.url. The questionnaire has to be stored in the forms server before you can launch it directly. You can use [Postman](https://www.postman.com/) to do so.

![image](https://user-images.githubusercontent.com/52597778/223016795-1b7b66d9-70c5-4a00-9fe6-b8e873a62c5b.png)

### Running in an unlaunched state

This method of running the app does not allow you to save responses as it is not connected to a CMS client.

1. Open https://www.smartforms.io/ in a browser.
2. You would have access to some pre-defined local questionnaires

NOTE: The app will not be able to view or save responses as it is not connected to a CMS client.


## Configuration

### Environment

The default configuration is set to:

```
# Ontoserver endpoint for $expand operations
# For commercial usage, you might want to get your own license at https://ontoserver.csiro.au/site/contact-us/ontoserver-contact-form/
REACT_APP_ONTOSERVER_URL=https://r4.ontoserver.csiro.au/fhir

# Questionnaire-hosting FHIR server
REACT_APP_FORMS_SERVER_URL=https://api.smartforms.io/fhir

# Debug mode - set to true in dev mode
REACT_APP_SHOW_DEBUG_MODE=false

# SMART App Launch scopes and launch contexts
# It will be necessary to tweak these variables if you are connecting the app to your own client CMS
REACT_APP_LAUNCH_SCOPE=launch/patient patient/*.read offline_access openid fhirUser
REACT_APP_LAUNCH_CLIENT_ID=smart-forms

```

In development mode, create a `.env.local` file in the `apps/smart-forms-react-app` directory and tweak the environment variables as needed.



### Run app locally

1. Clone this Git source repository onto your local machine from https://github.com/aehrc/smart-forms.

2. Install dependencies.

```sh
npm install
```

3. Change directory into the directory containing the Smart Forms app.

```sh
cd apps/smart-forms-react-app
```

4. Start the local server.

```sh
npm start
```

5. Follow the instructions [here](https://github.com/aehrc/smart-forms/edit/main/README.md#running-on-a-smart-cms-client-the-preferred-way) but replace https://www.smartforms.io/launch with http://localhost:3000/launch

## I found a bug/the app crashed, now what?

Definitely report it to us! [Create an issue within the repo](https://github.com/aehrc/smart-forms/issues/new) and we will try our best to get it fixed as soon as possible.


## Licensing and attribution

Smart Forms is copyright © 2022-2023, Commonwealth Scientific and Industrial
Research Organisation
(CSIRO) ABN 41 687 119 230. Licensed under
the [Apache License, version 2.0](https://www.apache.org/licenses/LICENSE-2.0).

This means that you are free to use, modify and redistribute the software as
you wish, even for commercial purposes.
