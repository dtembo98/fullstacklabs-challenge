import { Knex } from 'knex';
import { Bag } from '../../src/models';

export const up = (knex: Knex): Promise<void> =>
  knex.schema.createTable(Bag.tableName, (table: Knex.TableBuilder) => {
    table.increments();
    table.timestamps();
    table.integer('volume');
    table.string('title');
    table.integer('payloadVolume').defaultTo(0);
    table.integer('availableVolume').defaultTo(0);
  });

export const down = (knex: Knex): Promise<void> =>
  knex.schema.dropTable(Bag.tableName);
