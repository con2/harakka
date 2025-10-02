CREATE TYPE object_fit as ENUM ('cover', 'contain');

alter table storage_item_images add object_fit object_fit not null default 'cover';