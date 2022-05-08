import { Id, MaybeCompositeId, RelationMappings } from 'objection';
import { Bag } from './Bag';
import Base from './Base';

export class Cuboid extends Base {
  id!: Id;
  width!: number;
  height!: number;
  depth!: number;
  bagId?: Id;
  bag!: Bag;
  volume!: number;

  static tableName = 'cuboids';

  async updateBagVolume(): Promise<void> {
    const bag = await Bag.query()
      .findById(this.bagId as MaybeCompositeId)
      .withGraphFetched('cuboids');

    const payloadVolume = bag?.cuboids
      ?.map((cuboid) => cuboid.volume)
      .reduce(
        (prevValue, currentValue) => prevValue + currentValue,
        0
      ) as number;

    const availableVolume = (bag?.volume as number) - payloadVolume;
    await bag?.$query().update({
      availableVolume,
      payloadVolume,
    });
  }

  static get relationMappings(): RelationMappings {
    return {
      bag: {
        relation: Base.BelongsToOneRelation,
        modelClass: Bag,
        join: {
          from: 'cuboids.bagId',
          to: 'bags.id',
        },
      },
    };
  }
  $beforeInsert() {
    this.volume = this.width * this.depth * this.height;
  }

  async $afterInsert(): Promise<any> {
    await this.updateBagVolume();
  }
  async $afterUpdate(): Promise<any> {
    await await this.updateBagVolume();
  }
}

export default Cuboid;
