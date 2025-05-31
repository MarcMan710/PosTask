import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Select, Spin, message } from 'antd';
import { Line, Bar, Pie } from '@ant-design/plots';
import axios from 'axios';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;

const Analytics = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([moment().subtract(30, 'days'), moment()]);
  const [timeframe, setTimeframe] = useState('daily');
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalTime: 0,
    averageTime: 0,
    taskDistribution: [],
    timeDistribution: [],
    projectStats: [],
    userStats: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, timeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [startDate, endDate] = dateRange;
      const response = await axios.get('/api/analytics', {
        params: {
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD'),
          timeframe
        }
      });
      setStats(response.data);
    } catch (error) {
      message.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const taskCompletionConfig = {
    data: stats.taskDistribution,
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
  };

  const timeDistributionConfig = {
    data: stats.timeDistribution,
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
  };

  const projectStatsConfig = {
    data: stats.projectStats,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };

  const userStatsConfig = {
    data: stats.userStats,
    xField: 'value',
    yField: 'name',
    seriesField: 'type',
    legend: {
      position: 'top',
    },
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
  };

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2>Analytics & Reports</h2>
        <div className="analytics-filters">
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            allowClear={false}
          />
          <Select
            value={timeframe}
            onChange={setTimeframe}
            style={{ width: 120, marginLeft: 8 }}
          >
            <Option value="daily">Daily</Option>
            <Option value="weekly">Weekly</Option>
            <Option value="monthly">Monthly</Option>
          </Select>
        </div>
      </div>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Tasks"
                value={stats.totalTasks}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Completed Tasks"
                value={stats.completedTasks}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Time Spent"
                value={Math.round(stats.totalTime / 60)}
                suffix="hours"
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Average Time per Task"
                value={Math.round(stats.averageTime / 60)}
                suffix="hours"
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Card title="Task Completion Trend">
              <Line {...taskCompletionConfig} />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Time Distribution">
              <Line {...timeDistributionConfig} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Card title="Project Distribution">
              <Pie {...projectStatsConfig} />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="User Workload">
              <Bar {...userStatsConfig} />
            </Card>
          </Col>
        </Row>
      </Spin>

      <style jsx>{`
        .analytics-container {
          padding: 24px;
        }
        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .analytics-filters {
          display: flex;
          align-items: center;
        }
      `}</style>
    </div>
  );
};

export default Analytics; 