import React, { useState } from 'reactn';
import PropTypes from 'prop-types';
import { useMutation } from "@apollo/react-hooks";

import { baseUrl } from '../../Services/api';
import { queries } from "../../Services/graphql";

import { Col, Divider, Empty, Icon, Row, Tabs, Typography, Upload, message } from 'antd';

import BoardDescriptionForm from './BoardDescriptionForm';
import ProjectsContainer from './ProjectsContainer';
import ComponentsContainer from './Components/ComponentsContainer';

const BoardView = ({ board }) => {
  const [fileList, updateFileList] = useState([]);

  const [updateBoard] = useMutation(queries.updateBoard);

  const Dragger = Upload.Dragger;
  const { TabPane } = Tabs;
  const { Title } = Typography;

  const draggerProps = {
    action: `${baseUrl}/api/v1/uploads`,
    headers: {
      'X-CSRF-TOKEN': localStorage.csrf
    },
    withCredentials: true,
    data: { parent: 'board', parent_id: board.id, type: 'image' },
    fileList: fileList,
    name: 'file',
    onChange(info) {
      if (info.file.status === 'done') {
        const imageUrl = info.file.response.data.url;
        updateBoard({ variables: { id: board.id, imageUrl } })
          .then(res => message.success(`File ${info.file.name} uploaded.`))
          .catch(err => message.error('Could not update board.'));
      }

      if (info.file.status === 'error') {
        message.error(`Could not upload file ${info.file.name}`);
      }

      updateFileList([info.file]);
    }
  };

  return (
    <React.Fragment>
      <div className="board-view">
        <Row style={{ paddingBottom: '2rem' }}>
          <Col
            md={{ span: 12, offset: 6 }}
            sm={{ span: 18, offset: 3 }}
            xs={{ span: 22, offset: 1 }}
          >
            <div className="board-image-upload-container">
              <Dragger {...draggerProps} className="board-image-upload-overlay">
                <p className="ant-upload-drag-icon">
                  <Icon type="cloud-upload" />
                </p>
                <p className="ant-upload-text">Click or drag and drop an image file to upload</p>
                <p className="ant-upload-hint">Only JPG, JPEG, and PNG formats are supported.</p>
              </Dragger>
            </div>
            <img
              alt="board main"
              src={board.imageUrl || require('../../Assets/Icons/icon-board.svg')}
              className="board-main-image"
            />
          </Col>
        </Row>

        <Row>
          <Col xs={22} md={0} offset={1}>
            <BoardDescriptionForm board={board} />

            <Divider className="board-section-title">
              <Title level={3}>
                Projects
              </Title>
            </Divider>
            <Empty />

            <Divider className="board-section-title">
              <Title level={3}>
                Components
              </Title>
            </Divider>
            <ComponentsContainer boardId={board.id} />
          </Col>

          <Col xs={0} md={24}>
            <Tabs>
              <TabPane tab="Description" key="1">
                <BoardDescriptionForm board={board} />
              </TabPane>

              <TabPane tab="Projects" key="2">
                <ProjectsContainer boardId={board.id} />
              </TabPane>

              <TabPane tab="Components" key="3">
                <ComponentsContainer boardId={board.id} />
              </TabPane>
            </Tabs>
          </Col>
        </Row>
      </div>
    </React.Fragment>
  );
};

BoardView.propTypes = {
  board: PropTypes.object.isRequired
};

export default BoardView;
