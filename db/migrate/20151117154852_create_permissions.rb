class CreatePermissions < ActiveRecord::Migration
  def change
    create_table :permissions do |t|
      t.string :name
      t.string :subject_class
      t.string :action
      t.text :description

      t.timestamps null: false
    end
  end

  create_table(:permissions_roles, :id => false) do |t|
    t.references :permission
    t.references :role
  end
end
