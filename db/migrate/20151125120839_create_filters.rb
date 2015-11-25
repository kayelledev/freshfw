class CreateFilters < ActiveRecord::Migration
  def change
    create_table :shoppe_filters do |t|
      t.integer :filter_element_id
      t.string :filter_element_type

      t.timestamps null: false
    end
    create_table :shoppe_design_projects_filters do |t|
      t.references :design_project, index: true
      t.references :filter, index: true
      t.timestamps null: false
    end
    add_index :shoppe_design_projects_filters, [:design_project_id, :filter_id], :unique => true, :name => 'design_projects_filters_index'
  end
end
