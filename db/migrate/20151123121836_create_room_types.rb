class CreateRoomTypes < ActiveRecord::Migration
  def change
    create_table :shoppe_room_types do |t|
      t.string :name

      t.timestamps null: false
    end
  end
end
