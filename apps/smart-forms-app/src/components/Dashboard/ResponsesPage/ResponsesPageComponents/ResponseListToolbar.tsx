/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
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

import { IconButton, InputAdornment, Tooltip, Typography, useTheme } from '@mui/material';
import Iconify from '../../../Misc/Iconify';
import {
  StyledRoot,
  StyledSearch
} from '../../QuestionnairePage/QuestionnairePageComponents/QuestionnaireListToolbar.styles';
import dayjs from 'dayjs';
import type { ChangeEvent } from 'react';
import { useContext } from 'react';
import { SelectedQuestionnaireContext } from '../../../../features/dashboard/contexts/SelectedQuestionnaireContext.tsx';
import { SmartAppLaunchContext } from '../../../../features/smartAppLaunch/contexts/SmartAppLaunchContext.tsx';
import { constructName } from '../../../../features/smartAppLaunch/utils/launchContext.ts';
import type { ResponseListItem } from '../../../../features/dashboard/types/list.interface.ts';

interface Props {
  selected: ResponseListItem | undefined;
  searchInput: string;
  clearSelection: () => void;
  onSearch: (searchInput: string) => void;
}

function ResponseListToolbar(props: Props) {
  const { selected, searchInput, clearSelection, onSearch } = props;

  const { selectedQuestionnaire, existingResponses, clearSelectedQuestionnaire } = useContext(
    SelectedQuestionnaireContext
  );
  const { patient } = useContext(SmartAppLaunchContext);
  const theme = useTheme();

  const selectedQuestionnaireTitle =
    selectedQuestionnaire?.listItem.title ?? 'selected questionnaire';

  return (
    <StyledRoot
      data-test="responses-list-toolbar"
      sx={{
        ...(selected
          ? {
              color: 'primary.main',
              bgcolor: 'pale.primary'
            }
          : selectedQuestionnaire && existingResponses.length > 0
          ? {
              color: 'secondary.main',
              bgcolor: 'pale.secondary'
            }
          : null)
      }}>
      {selected ? (
        <Typography component="div" variant="subtitle1">
          {selected.title} — {dayjs(selected.authored).format('LL')} selected
        </Typography>
      ) : selectedQuestionnaire && existingResponses.length > 0 ? (
        <Typography variant="subtitle1">
          Displaying responses from the <b>{selectedQuestionnaireTitle}</b> questionnaire
        </Typography>
      ) : (
        <StyledSearch
          value={searchInput}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onSearch(event.target.value)}
          placeholder="Search responses..."
          startAdornment={
            <InputAdornment position="start">
              <Iconify
                icon="eva:search-fill"
                sx={{ color: 'text.disabled', width: 20, height: 20 }}
              />
            </InputAdornment>
          }
          data-test="search-field-responses"
          sx={{
            '&.Mui-focused': {
              width: '50%',
              boxShadow: theme.customShadows.z4
            }
          }}
        />
      )}

      {selected ? (
        <Tooltip title="Clear">
          <IconButton onClick={clearSelection}>
            <Iconify icon="ic:baseline-clear" />
          </IconButton>
        </Tooltip>
      ) : selectedQuestionnaire && existingResponses.length > 0 ? (
        <Tooltip title="Remove questionnaire filter">
          <IconButton
            onClick={() => clearSelectedQuestionnaire()}
            data-test="button-remove-questionnaire-filter">
            <Iconify icon="material-symbols:filter-alt-off-outline" />
          </IconButton>
        </Tooltip>
      ) : (
        <Typography variant="subtitle1">
          Showing responses for <b>{constructName(patient?.name)}</b>
        </Typography>
      )}
    </StyledRoot>
  );
}

export default ResponseListToolbar;
