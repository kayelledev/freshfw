class AddSizesToItemAddRoom < ActiveRecord::Migration
  def change
    create_table :rooms do |t|
      t.string :name, null: true
      t.text :description, null: true
      t.integer :width, default: 0
      t.integer :height, default: 0

      t.timestamps null: false
    end

    create_table :room_items do |t|
      t.integer :room_id
      t.integer :item_id

      t.timestamps null: false
    end
  end
end
