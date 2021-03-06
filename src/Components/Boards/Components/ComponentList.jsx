import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/react-hooks";

import { queries } from "../../../Services/graphql";

import { Button, Collapse, Icon, Popconfirm, Tooltip, Typography, Upload, message } from "antd";

import getUploadProps from "../../../Services/getUploadProps";

const ComponentList = ({ components }) => {
  const [fileList, updateFileList] = useState([]);

  const [updateComponent] = useMutation(
    queries.updateComponent,
    { refetchQueries: [{ query: queries.projectsBoardsComponents }] }
  );

  const [deleteComponent] = useMutation(
    queries.deleteComponent,
    { refetchQueries: [{ query: queries.projectsBoardsComponents }] }
  );

  const { Panel } = Collapse;
  const { Paragraph } = Typography;

  const uploadProps = id => getUploadProps({
    parent: 'component',
    parent_id: id,
    type: 'image',
    fileList,
    updateFileList,
    showUploadList: false,
    onSuccess: imageUrl => updateComponent({ variables: { id, imageUrl } })
  });

  const updateName = (id, componentName, str) => {
    updateComponent({
      variables: { id, name: str }
    }).then(res => message.success(`${componentName} saved.`))
      .catch(err => message.error('Could not update.'));
  };

  const updateDescription = (id, componentName, str) => {
    updateComponent({
      variables: { id, description: str }
    }).then(res => message.success(`${componentName} saved.`))
      .catch(err => message.error('Could not update.'));
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    deleteComponent({ variables: { id } })
      .then(res => message.success(`Deleted ${res.data.deleteComponent.component.name}`))
      .catch(err => message.error('Could not delete component.'))
  };

  return (
    <Collapse
      expandIconPosition="right"
      expandIcon={
        ({ isActive }) =>
          <Icon type="eye" theme={isActive ? "filled" : "outlined"} />
      }
    >
      {
        components.map(component =>
          <Panel
            extra={
              <div className="list-component-title-extras">
                <Popconfirm
                  title="Delete component?"
                  onConfirm={e => handleDelete(e, component.id)}
                  onCancel={e => e.stopPropagation()}
                >
                  <Icon type="delete" onClick={e => e.stopPropagation()} />
                </Popconfirm>
              </div>
            }
            header={
              <div className="list-component-title">
                <Link to={`/components/${component.id}`} target="_blank">
                  <Icon type="arrow-right" />
                </Link>

                <span onClick={e => e.stopPropagation()} className="component-image-upload">
                  <Upload {...uploadProps(component.id)}>
                    <Tooltip
                      title={ component.imageUrl ?
                        <img
                          src={component.imageUrl}
                          alt={`${component.name}`}
                          className="tooltip-image"
                        /> :
                        'Upload an image'
                      }
                    >
                      <Button type="link">
                        <img
                          alt={component.name}
                          src={component.imageUrl || require('../../../Assets/Images/component-generic.svg')}
                          className="component-image-icon"
                        />
                      </Button>
                    </Tooltip>
                  </Upload>
                </span>

                {component.name}
              </div>
            }
            key={`component-panel-${component.id}`}
          >
            <Paragraph editable={{ onChange: str => updateName(component.id, component.name, str) }}>
              { component.name }
            </Paragraph>

            <Paragraph editable={{ onChange: str => updateDescription(component.id, component.name, str) }}>
              { component.description }
            </Paragraph>
          </Panel>
        )
      }
    </Collapse>
  );
};

export default ComponentList;
