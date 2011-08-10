class CreateProjects < ActiveRecord::Migration
  def self.up
    create_table :projects do |t|
      t.text :authors
      t.string :title
      t.text :description
      t.datetime :creation_time
      t.datetime :modified_time
      
      t.timestamps
    end
  end

  def self.down
    drop_table :projects
  end
end
