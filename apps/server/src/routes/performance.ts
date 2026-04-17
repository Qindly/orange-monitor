import type { Request, Response } from 'express';
import type { PerformanceIngestRequest } from '@orange-monitor/protocol';
import {
  getPerformanceOverview,
  recordPerformanceMetrics,
} from '../services/performance.service';

/**
 * POST /performance
 *
 * 接收前端 SDK 上报的性能指标数据。
 * 当前为最基础的版本：校验 → 打印日志。
 * 后续可扩展：持久化到数据库、聚合统计、告警等。
 */
export async function performanceHandler(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body as PerformanceIngestRequest;

    // ── 基础校验 ──
    if (!body.projectId) {
      res.status(400).json({ success: false, message: 'Missing projectId' });
      return;
    }

    if (!Array.isArray(body.metrics) || body.metrics.length === 0) {
      res.status(400).json({ success: false, message: 'Missing or empty metrics' });
      return;
    }

    recordPerformanceMetrics(body.projectId, body.metrics);

    // ── 处理每条性能指标 ──
    for (const metric of body.metrics) {
      console.log(
        `[perf] ${metric.metricName} = ${metric.value}${metric.metricName === 'CLS' ? '' : 'ms'} ` +
        `(${metric.rating}) | url=${metric.url} | session=${metric.sessionId ?? '-'}`
      );
    }

    // TODO: 后续在这里接入持久化逻辑
    // await savePerformanceMetrics(body.projectId, body.metrics);

    res.json({
      success: true,
      message: `Received ${body.metrics.length} metric(s)`,
    });
  } catch (error) {
    console.error('[perf] failed to process performance data', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

export async function getPerformanceOverviewHandler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const projectId =
      typeof req.query.projectId === 'string' && req.query.projectId.trim()
        ? req.query.projectId.trim()
        : undefined;

    res.json({
      success: true,
      data: getPerformanceOverview(projectId),
    });
  } catch (error) {
    console.error('[perf] failed to read performance data', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
