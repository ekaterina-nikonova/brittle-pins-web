import React, { useEffect, useState } from "react";
import { useDispatch, useGlobal } from "reactn";

import { acceptInvitation,
  deleteInvitationSilent,
  deleteInvitationWithEmail,
  getInvitations } from "../../Services/api";

import { Empty, Icon, List, Popconfirm, Result, Tooltip } from "antd";

const InvitationsContainer = () => {
  const [invitations, setInvitations] = useGlobal('invitations');
  const [error, setError] = useState();

  const dispatch = useDispatch('invitationReducer');

  useEffect(() => {
    getInvitations()
      .then(response => setInvitations(response.data))
      .catch(error => setError(error));
  }, []);

  const handleAccept = invitation => {
    acceptInvitation(invitation.id)
      .then(dispatch({
        action: 'update',
        data: { ...invitation, accepted_at: new Date() }
      }));
  };

  const handleDeleteSilent = invitation => {
    deleteInvitationSilent(invitation.id)
      .then(dispatch({
        action: 'destroy',
        data: { ...invitation }
      }));
  };

  const handleDeleteWithEmail = invitation => {
    deleteInvitationWithEmail(invitation.id)
      .then(dispatch({
        action: 'destroy',
        data: { ...invitation }
      }));
  };

  return (
    <React.Fragment>
      { error && (
        <div className="top-level-state">
          <Result
            status="error"
            title="Something's wrong"
            subTitle="Could not fetch invitations."
          />
        </div>
      ) }

      { (!error && !invitations.length) && (
        <Empty
          description="No invitations."
          className="top-level-state"
        />
      ) }

      { (!error && !!invitations.length) && (
        <List
          dataSource={invitations}
          className="admin-invitation-list"
          renderItem={invitation => (
            <List.Item
              actions={InvitationActions({
                invitation,
                accept: handleAccept,
                deleteSilent: handleDeleteSilent,
                deleteWithEmail: handleDeleteWithEmail
              })}>
              <List.Item.Meta
                avatar={
                  <Tooltip title={tooltipTitle({ invitation })}>
                    { InvitationAvatar({ invitation }) }
                  </Tooltip>
                }
                title={invitation.email}
                description={invitation.code}
              />
            </List.Item>
          )}
        />
      ) }
    </React.Fragment>
  );
};

const tooltipTitle = ({ invitation }) => {
  const { used_at, accepted_at, created_at } = invitation;

  if (used_at) {
    return `Used ${ new Date(used_at) }`;
  } else if (accepted_at) {
    return `Sent ${ new Date(accepted_at) }`;
  } else return `Requested ${ new Date(created_at) }`;
};

const InvitationAvatar = ({ invitation }) => {
  const { used_at, accepted_at } = invitation;

  if (used_at) {
    return <Icon type="check" />;
  } else if (accepted_at) {
    return <Icon type="ellipsis" />;
  } else return <Icon type="question" />
};

const InvitationActions = ({ invitation, accept, deleteWithEmail, deleteSilent }) => {
  const actions = [];
  if (invitation.used_at) {
    actions.push(
      <Popconfirm
        placement="topRight"
        title={`Delete invitation for ${invitation.email}?`}
        onConfirm={ () => deleteSilent(invitation) }
        okText="Yes"
      >
        <Icon type="close-circle" />
      </Popconfirm>
    );
  }

  if (!invitation.accepted_at && !invitation.used_at) {
    actions.push(
      <Popconfirm
        placement="topRight"
        title={`Send rejection email to ${invitation.email}?`}
        onConfirm={ () => deleteWithEmail(invitation) }
        onCancel={ () => deleteSilent(invitation) }
        okText="Yes"
        cancelText="No"
      >
        <Icon type="close-circle" />
      </Popconfirm>
    );
    actions.push(
      <Popconfirm
        placement="topRight"
        title={`Send invitation code to ${invitation.email}?`}
        onConfirm={ () => accept(invitation) }
        okText="Yes"
        cancelText="No"
      >
        <Icon type="check-circle" />
      </Popconfirm>
    );
  }

  return actions;
};

export default InvitationsContainer;
