/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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

// @ts-ignore
import React from 'react';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { BaseRenderer } from '../components';
import { QueryClientProvider } from '@tanstack/react-query';
import ThemeProvider from '../theme/Theme';
import useQueryClient from '../hooks/useQueryClient';
import useBuildFormForStorybook from './useBuildFormForStorybook';
import { buildForm } from '../utils';
import BuildFormButtonForStorybook from './BuildFormButtonForStorybook';

interface BuildFormButtonTesterWrapperProps {
  questionnaire: Questionnaire;
  questionnaireResponse?: QuestionnaireResponse;
}

function BuildFormButtonTesterWrapper(props: BuildFormButtonTesterWrapperProps) {
  const { questionnaire, questionnaireResponse } = props;

  const queryClient = useQueryClient();

  const isBuilding = useBuildFormForStorybook(questionnaire);

  async function handleBuildForm() {
    await buildForm(questionnaire, questionnaireResponse);
  }

  if (isBuilding) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <div>
          <BuildFormButtonForStorybook onBuild={handleBuildForm} />
          <BaseRenderer />
        </div>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default BuildFormButtonTesterWrapper;
