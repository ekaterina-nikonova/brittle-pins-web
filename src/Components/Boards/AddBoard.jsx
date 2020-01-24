import React, { useState } from 'react';
import { useMutation } from "@apollo/react-hooks";

import { baseUrl, updateBoard } from '../../Services/api';
import { queries } from "../../Services/graphql";

import { Button, Collapse, Icon, Menu, message, Steps, Upload } from 'antd';

import AutoForm from 'uniforms-antd/AutoForm';
import LongTextField from 'uniforms-antd/LongTextField';
import SimpleSchema from 'simpl-schema';
import TextField from 'uniforms-antd/TextField';

import EmptyFullPage from '../UI/EmptyFullPage';

const AddBoard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [newBoardId, setNewBoardId] = useState('');

  const [createBoard] = useMutation(queries.createBoard);

  const Dragger = Upload.Dragger;
  const Panel = Collapse.Panel;
  const Step = Steps.Step;

  const schema = new SimpleSchema({
    name: String,
    description: String
  });

  const NameDescriptionForm = () => {
    return (
      <AutoForm
        onSubmit={submit}
        schema={schema}
      >
        <TextField name="name" />
        <LongTextField name="description" />
        <Button type="primary" htmlType="submit" className="button-right">
          <span>Next</span>
          <Icon type="arrow-right" />
        </Button>
      </AutoForm>
    );
  };

  const ImageUpload = () => {
    const props = {
      action: `${baseUrl}/api/v1/uploads`,
      headers: {
        'X-CSRF-TOKEN': localStorage.csrf
      },
      withCredentials: true,
      data: { parent: 'board', parent_id: newBoardId, type: 'image' },
      name: 'file',
      onChange(info) {
        if (info.file.status === 'done') {
          message.success(`File ${info.file.name} uploaded.`);
        }

        if (info.file.status === 'error') {
          message.error(`Could not upload file ${info.file.name}`);
        }
      }
    };

    return (
      <React.Fragment>
        <Dragger {...props} className="board-image-upload">
          <p className="ant-upload-drag-icon">
            <Icon type="cloud-upload" />
          </p>
          <p className="ant-upload-text">Click or drag and drop an image file to upload</p>
          <p className="ant-upload-hint">Only JPG, JPEG, and PNG formats are supported.</p>
        </Dragger>
        <Button type="primary" onClick={moveToNextStep} className="button-right">
          <span>Next</span>
          <Icon type="arrow-right" />
        </Button>
      </React.Fragment>
    );
  };

  const resetAndClose = () => {
    setCurrentStep(0);
    setNewBoardId('');
  };

  const steps = [{
    content: <NameDescriptionForm />,
    icon: 'info-circle',
    title: 'Info'
  }, {
    content: <ImageUpload />,
    icon: 'picture',
    title: 'Image'
  }, {
    content: (
      <div>
        <EmptyFullPage description="Soon you'll be able to add components here." />
        <Button type="primary" onClick={resetAndClose} className="button-right">
          <span>Done</span>
          <Icon type="check" />
        </Button>
      </div>
    ),
    icon: 'bars',
    title: 'Components'
  }];

  const moveToNextStep = () => setCurrentStep(currentStep + 1);

  const submit = async data => {
    const create = async data => createBoard({ variables: {
      name: data.name,
      description: data.description
    } });

    if (newBoardId) {
      updateBoard({ boardId: newBoardId, updates: data })
    } else {
      create(data)
        .then(response => {
          setNewBoardId(response.data.createBoard.board.id);
          moveToNextStep();
        })
        .catch(error => message.error(`Could not create a board. ${error}`));
    }
  };

  return (
    <Menu mode="horizontal">
      <Collapse bordered={false}>
        <Panel header="Add new board" key="addBoardPanel">
          <Steps current={currentStep}>
            {steps.map(step =>
              <Step
                icon={<Icon type={step.icon} />}
                key={step.title}
                title={step.title}
              />
            )}
          </Steps>
          {steps[currentStep].content}
        </Panel>
      </Collapse>
    </Menu>
  );
};

export default AddBoard;
