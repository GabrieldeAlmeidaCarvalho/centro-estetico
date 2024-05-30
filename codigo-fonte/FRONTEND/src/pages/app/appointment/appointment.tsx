import { Helmet } from 'react-helmet-async'
import { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ComboboxDemo } from '@/components/ui/combobox';
import { z } from 'zod';
import { DatePickerDemo } from '@/components/ui/data-picker';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { RadioGroup } from '@radix-ui/react-dropdown-menu';
import { env } from '../../../env'
import axios from 'axios';
import { createAppointment } from '@/api/appointment';
import { getUsers } from '@/api/users';
import { useMutation } from '@tanstack/react-query';
import { FacialForm } from './facialForm';

const Local = z.enum(['OnSight', 'InHome'])

type client = {
  id: string,
  name: string
}

type User = {
  id: string,
  name: string,
  email: string
}

const registerAppointmentForm = z
  .object({
    local: Local,
    specialty: z.string().min(1, 'Preencha o nome do procedimento'),
    client: z.string({ required_error: 'Selecione um cliente' }),
    user: z.string({ required_error: 'Selecione o profissional' }),
    appointment_hour: z.string().min(1, 'Selecione o horário da consulta'),
    observations: z.string().optional(),
    appointment_type: z.string({ required_error: 'Selecione o tipo de consulta' }), 
    date: z.date({ required_error: 'Selecione uma data' })
  })

type RegisterAppointmentForm = z.infer<typeof registerAppointmentForm>


export function Appointment() {
  const [date, setDate] = useState<Date>()
  const [selectedClient, setSelectedClient] = useState<string>()
  const [clients, setClients] = useState<client[]>([])
  const [selectedUser, setSelectedUser] = useState<string>()
  const [users, setUsers] = useState<User[]>([])
  const [appointmentType, setAppointmentType] = useState<string>()
  const [isFacial, setIsFacial] = useState<boolean>(false)
  const [faceSelections, setFaceSelections] = useState({
    leftFace0: false,
    leftFace1: false,
    leftFace2: false,
    leftFace3: false,
    leftFace4: false,
    leftFace5: false,
    leftFace6: false,
    leftFace7: false,
    leftFace8: false,
    leftFace9: false,
    leftFace10: false,
    rightFace0: false,
    rightFace1: false,
    rightFace2: false,
    rightFace3: false,
    rightFace4: false,
    rightFace5: false,
    rightFace6: false,
    rightFace7: false,
    rightFace8: false,
    rightFace9: false,
    rightFace10: false,
    frontFace0: false,
    frontFace1: false,
    frontFace2: false,
    frontFace3: false,
    frontFace4: false,
    frontFace5: false,
    frontFace6: false,
    frontFace7: false,
    frontFace8: false,
    frontFace9: false,
    frontFace10: false,
    frontFace11: false,
  })


  const {
    handleSubmit,
    register,
    setValue,
    control,
    formState: { isSubmitting, errors },
  } = useForm<RegisterAppointmentForm>({
    resolver: zodResolver(registerAppointmentForm),
    defaultValues: {
      local: 'OnSight'
    },
  })

  const { mutateAsync: newAppointment } = useMutation({
    mutationFn: createAppointment,
  })

  const handleFaceSelectionChange = (part: string, value: boolean) => {
    setFaceSelections(prev => ({ ...prev, [part]: value }));
  };

  useEffect(() => {
    async function fetchUsersData() {
      const { data: usersData } = await getUsers('');

      if (usersData && usersData.users) {
        setUsers(usersData.users)
      } else {
        setUsers([])
      }
    }

    fetchUsersData();
  }, []);


  useEffect(() => {
    async function fetchClientsData() {
      const { data: clientsData } = await axios.get(`${env.VITE_API_URL}/clients?name=`);
      setClients(clientsData);
    }

    fetchClientsData();
  }, []);

  useEffect(() => {
    if (date) {
      setValue('date', date, { shouldValidate: true })
    }
  }, [date, setDate])

  useEffect(() => {
    if (appointmentType) {
      setValue('appointment_type', appointmentType, { shouldValidate: true })
      if (appointmentType === 'Skin') {
        setIsFacial(true)
      } else {
        setIsFacial(false)
      }
    }
  }, [appointmentType, setAppointmentType])

  useEffect(() => {
    if (selectedClient) {
      setValue('client', selectedClient, { shouldValidate: true })
    }
  }, [selectedClient, setValue])

  useEffect(() => {
    if (selectedUser) {
      setValue('user', selectedUser, { shouldValidate: true })
    }
  }, [selectedUser, setValue])

  async function handleCreateAppointment(data: RegisterAppointmentForm) {
    try {
      const { client, user, local, appointment_hour, date, ...appointmentDataWithoutIds } = data;

      const appointmentData = {
        clientId: client,
        userId: user,
        presencial: local === 'OnSight' ? true : false,
        appointment_date: date,
        appointment_hour: appointment_hour,
        ...faceSelections,
        ...appointmentDataWithoutIds
      }
      await newAppointment(appointmentData)

      toast.success('Consulta cadastrada!')
    } catch (error) {
      toast.error('Erro ao cadastrar consulta!')
    }
  }

  return (
    <form
      className='justify-center flex flex-col bg-input p-5 rounded-xl'
      onSubmit={handleSubmit(handleCreateAppointment)}

    >
      <Helmet title="appointment" />

      <ComboboxDemo
        title="Tipo de consulta"
        needSearch={false}
        selectFunction={setAppointmentType}
        options={[
          {
            name: "Capilar",
            id: "Hair"
          },
          {
            name: "Corporal",
            id: "Body"
          },
          {
            name: "Facial",
            id: "Skin"
          }
        ]}
      />
      {errors.appointment_type && (
        <small className="text-red-500">{errors.appointment_type.message}</small>
      )}

      <div className="mb-6 mt-6">
        <label className="block text-sm font-medium" htmlFor="especialidade" >
          Especialidade
        </label>
        <input
          id="specialty"
          type="text"
          className="text-primary block w-full px-4 py-2 bg-transparent border-b border-gray-200 outline-none"
          placeholder='Peeling de Diamante...'
          {...register('specialty')}
        />
        {errors.specialty && (
          <small className="text-red-500">{errors.specialty.message}</small>
        )}
      </div>

      <Controller
        name="local"
        control={control}
        render={({ field }) => (
          <RadioGroup
            defaultValue="onSight"
            aria-labelledby="local"
            onValueChange={field.onChange}
            value={field.value}
            className="mb-7 pb-3 border-b border-gray-200 outline-none"
            {...register('local')}
          >
            <label className="block text-sm font-medium" htmlFor="nome">
              Tipo de atendimento
            </label>

            <div className='flex justify-between mt-2 '>
              <div>
                <input
                  id="onSight"
                  type="radio"
                  className="mr-2 bg-transparent checked:bg-primary ring-offset-1 h-3 w-3 rounded-full appearance-none box-border ring-2 ring-primary"
                  value="OnSight"
                  onChange={(e) => field.onChange(e.target.value)}
                  checked={field.value === "OnSight"}
                />
                <label htmlFor="onSight" className="text-primary font-semibold text-base">Presencial</label>
              </div>

              <div>
                <input
                  id="inHome"
                  type="radio"
                  className="ml-4 mr-2 bg-transparent checked:bg-primary checked:ring-offset-1 h-3 w-3 rounded-full appearance-none box-border ring-2 ring-primary"
                  value="InHome"
                  onChange={(e) => field.onChange(e.target.value)}
                  checked={field.value === "InHome"} />
                <label htmlFor="inHome" className="text-primary font-semibold text-base pr-5">Casa</label>
              </div>
            </div>
          </RadioGroup>

        )}
      />

      <ComboboxDemo
        searchBoxPlaceholder="Pesquise um cliente"
        title="Cliente"
        needSearch={true}
        selectFunction={setSelectedClient}
        options={clients}
      />
      {errors.client && (
        <small className="text-red-500">{errors.client.message}</small>
      )}
      <br />
      <ComboboxDemo
        searchBoxPlaceholder="Pesquise um profissional"
        title="Profissional"
        needSearch={true}
        selectFunction={setSelectedUser}
        options={users}
      />
      {errors.user && (
        <small className="text-red-500">{errors.user.message}</small>
      )}

      <div className="mb-7 mt-7">
        <label className="block text-sm font-medium pb-2" htmlFor="date">
          Data da consulta
        </label>
        <DatePickerDemo
          selectDate={setDate}
        />
        {errors.date && (
          <small className="text-red-500">{errors.date.message}</small>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium" htmlFor="hour">
          Horário da consulta
        </label>
        <input
          id="hour"
          type="time"
          className="text-primary block w-full px-4 py-2 bg-transparent border-b border-gray-200 outline-none"
          {...register('appointment_hour')}
        />
        {errors.appointment_hour && (
          <small className="text-red-500">{errors.appointment_hour.message}</small>
        )}
      </div>

      {
        isFacial && <FacialForm
          onSelectionChange={handleFaceSelectionChange}
        />
      }

      <div className="mt-3 mb-6">
        <label className="block text-xl font-semibold pb-1" htmlFor="anotations">
          Anotações
        </label>
        <textarea
          placeholder='Anote aqui o necessário...'
          id="anotations"
          className="text-primary block w-full h-44 px-4 py-2 bg-input shadow-xl rounded-xl border border-gray-200"
          {...register('observations')}
        />
      </div>


      <Button
        variant={'primary'}
        type='submit'
        className='mt-6 mb-3'
        disabled={isSubmitting}
      >
        Salvar
      </Button>

    </form>

  )
}
