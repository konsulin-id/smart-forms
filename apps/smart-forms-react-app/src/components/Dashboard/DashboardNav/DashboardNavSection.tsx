import { Box, List, ListItemButton, ListItemText, Typography, useTheme } from '@mui/material';
import React, { memo, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { StyledNavItemIcon } from '../../StyledComponents/NavSection.styles';
import { SourceContext } from '../../../Router';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

export interface NavButton {
  title: string;
  path: string;
  icon: JSX.Element;
  disabled?: boolean;
}

function DashboardNavSection() {
  const { source } = useContext(SourceContext);

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ px: 2.5, pb: 0.75 }}>
        <Typography variant="overline">Pages</Typography>
      </Box>
      <List disablePadding sx={{ px: 1 }}>
        <NavItem title={'Questionnaires'} path={'/questionnaires'} icon={<AssignmentIcon />} />
        <NavItem
          title={'Responses'}
          path={'/responses'}
          icon={<AssignmentTurnedInIcon />}
          disabled={source === 'local'}
        />
      </List>
    </Box>
  );
}

function NavItem(props: NavButton) {
  const { title, path, icon, disabled } = props;
  const theme = useTheme();

  return (
    <ListItemButton
      component={NavLink}
      to={path}
      disableGutters
      disabled={disabled}
      sx={{
        ...theme.typography.subtitle2,
        height: 48,
        textTransform: 'capitalize',
        color: theme.palette.text.secondary,
        borderRadius: Number(theme.shape.borderRadius) * 0.2,

        '&.active': {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.action.selected,
          fontWeight: theme.typography.fontWeightBold
        }
      }}>
      <StyledNavItemIcon>{icon}</StyledNavItemIcon>

      <ListItemText disableTypography primary={title} />
    </ListItemButton>
  );
}

export default memo(DashboardNavSection);