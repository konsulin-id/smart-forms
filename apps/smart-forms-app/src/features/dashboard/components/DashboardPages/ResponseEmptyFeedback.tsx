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

import { Typography } from '@mui/material';
import EmptyListImage from '../../../../components/Logos/EmptyListImage.tsx';

interface ResponseEmptyFeedbackProps {
  searchInput: string;
}

function ResponseEmptyFeedback(props: ResponseEmptyFeedbackProps) {
  const { searchInput } = props;

  return (
    <>
      <EmptyListImage />
      {searchInput === '' ? (
        <Typography>
          No results found.
          <br /> It doesn&apos;t seem like you have any responses yet.
        </Typography>
      ) : (
        <Typography>
          No results found for &nbsp;
          <strong>&quot;{searchInput}&quot;</strong>.
          <br /> Try searching for something else.
        </Typography>
      )}
    </>
  );
}

export default ResponseEmptyFeedback;
