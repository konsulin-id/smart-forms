/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 10.59 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Box } from '@mui/material';
import { useQuestionnaireStore } from '@aehrc/smart-forms-renderer';
import SdcIdeQuestionnairePicker from './SdcIdeQuestionnairePicker.tsx';
import SdcIdeQuestionnaireDisplayer from './SdcIdeQuestionnaireDisplayer.tsx';

function SdcIdeQuestionnaireScreen() {
  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();

  const showPicker = !sourceQuestionnaire;

  return (
    <Box>
      {showPicker ? (
        <SdcIdeQuestionnairePicker />
      ) : (
        <SdcIdeQuestionnaireDisplayer sourceQuestionnaire={sourceQuestionnaire ?? null} />
      )}
    </Box>
  );
}

export default SdcIdeQuestionnaireScreen;