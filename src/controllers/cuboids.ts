import { Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';
import { Id } from 'objection';
import { Bag, Cuboid } from '../models';

export const list = async (req: Request, res: Response): Promise<Response> => {
  const ids = req.query.ids as Id[];
  const cuboids = await Cuboid.query().findByIds(ids).withGraphFetched('bag');

  return res.status(200).json(cuboids);
};

export const get = async (req: Request, res: Response): Promise<Response> => {
  const id = req.params.id as Id;
  const cuboid = await Cuboid.query().findById(id);
  if (!cuboid) {
    return res.sendStatus(HttpStatus.NOT_FOUND);
  }
  return res.status(HttpStatus.OK).json({ ...cuboid });
};

export const create = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { width, height, depth, bagId } = req.body;

  const bag = await Bag.query().findById(bagId).withGraphFetched('cuboids');
  if (!bag) {
    return res.sendStatus(HttpStatus.NOT_FOUND);
  }
  const cuboidVolume = width * height * depth;

  if (cuboidVolume > bag.availableVolume) {
    return res
      .status(HttpStatus.UNPROCESSABLE_ENTITY)
      .json({ message: 'Insufficient capacity in bag' });
  }

  const cuboid = await Cuboid.query().insert({
    width,
    height,
    depth,
    bagId,
  });

  return res.status(HttpStatus.CREATED).json(cuboid);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { width, height, depth } = req.body;
  const id = req.params.id as Id;
  const cuboid = await Cuboid.query().findById(id);
  if (!cuboid) {
    return res.sendStatus(HttpStatus.NOT_FOUND);
  }

  const newCuboidVoume = width * height * depth;
  const bag = await cuboid.$relatedQuery('bag');

  if (newCuboidVoume > bag.availableVolume) {
    return res
      .status(HttpStatus.UNPROCESSABLE_ENTITY)
      .json({ message: 'Insufficient capacity in bag' });
  }

  const updatedCuboid = await cuboid.$query().updateAndFetch({
    width,
    height,
    depth,
    volume: newCuboidVoume,
  });
  return res.status(HttpStatus.OK).json({ ...updatedCuboid });
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id = req.params.id as Id;
  const cuboid = await Cuboid.query().deleteById(id);

  if (!cuboid) {
    return res.sendStatus(HttpStatus.NOT_FOUND);
  }
  return res.sendStatus(HttpStatus.OK);
};
